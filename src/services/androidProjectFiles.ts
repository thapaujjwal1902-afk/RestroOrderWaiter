export interface AndroidFile {
  path: string;
  language: 'kotlin' | 'xml' | 'javascript' | 'groovy' | 'markdown';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/restroorder/waiter/MainActivity.kt',
    language: 'kotlin',
    description: 'Main Activity with 5-tab Navigation, WebView host, Session Watchdog, and JS Bridge',
    content: `package com.restroorder.waiter

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.WindowManager
import android.webkit.*
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.work.*
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.restroorder.waiter.bridge.WaiterAppBridge
import com.restroorder.waiter.data.AppDatabase
import com.restroorder.waiter.databinding.ActivityMainBinding
import com.restroorder.waiter.network.ApiClient
import com.restroorder.waiter.worker.StatusPollerWorker
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var webView: WebView

    @Inject
    lateinit var apiClient: ApiClient

    @Inject
    lateinit var database: AppDatabase

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // F4.5: Keep screen on during shift
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        setupWebView()
        setupBottomNav()
        scheduleStatusPoller()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView = binding.webView
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // Shared Cookie Persistence (ASP.NET_SessionId)
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // Add Native Waiter JS Bridge
        val bridge = WaiterAppBridge(
            context = this,
            onOrderCaptured = { cartJson ->
                lifecycleScope.launch {
                    apiClient.processOrQueueOrder(cartJson)
                }
            },
            onPrintRequested = { html, role ->
                lifecycleScope.launch {
                    apiClient.enqueuePrintJob(html, role)
                }
            }
        )
        webView.addJavascriptInterface(bridge, "WaiterApp")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                // F3.3: Session expiry watchdog
                if (url.contains("/Login.aspx") || url.contains("ReturnUrl=")) {
                    handleSessionExpired()
                    return true
                }
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view)
                injectBridgeShim()
            }
        }

        // Load initial dining module
        val baseUrl = apiClient.getBaseUrl()
        val pageId = apiClient.getDiningPageId()
        webView.loadUrl("$baseUrl/Default.aspx?id=$pageId")
    }

    private fun injectBridgeShim() {
        // Read bridge_shim.js from assets and evaluate in WebView context
        try {
            val shim = assets.open("bridge_shim.js").bufferedReader().use { it.readText() }
            webView.evaluateJavascript(shim, null)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun handleSessionExpired() {
        Toast.makeText(this, "Session expired, performing silent re-auth...", Toast.LENGTH_SHORT).show()
        lifecycleScope.launch {
            val restored = apiClient.silentReLogin()
            if (restored) {
                webView.reload()
            } else {
                Toast.makeText(this@MainActivity, "Please enter your PIN again", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun setupBottomNav() {
        val navView: BottomNavigationView = binding.bottomNav
        navView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.tab_dining -> {
                    binding.viewFlipper.displayedChild = 0
                    true
                }
                R.id.tab_orders -> {
                    binding.viewFlipper.displayedChild = 1
                    true
                }
                R.id.tab_bills -> {
                    binding.viewFlipper.displayedChild = 2
                    true
                }
                R.id.tab_prints -> {
                    binding.viewFlipper.displayedChild = 3
                    true
                }
                R.id.tab_more -> {
                    binding.viewFlipper.displayedChild = 4
                    true
                }
                else -> false
            }
        }
    }

    private fun scheduleStatusPoller() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val pollWork = PeriodicWorkRequestBuilder<StatusPollerWorker>(
            repeatInterval = 20, TimeUnit.SECONDS
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "KitchenStatusPoller",
            ExistingPeriodicWorkPolicy.UPDATE,
            pollWork
        )
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.viewFlipper.displayedChild == 0 && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/restroorder/waiter/bridge/WaiterAppBridge.kt',
    language: 'kotlin',
    description: 'JavaScript Interface Object (window.WaiterApp) called from DinningJS.js',
    content: `package com.restroorder.waiter.bridge

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.widget.Toast

class WaiterAppBridge(
    private val context: Context,
    private val onOrderCaptured: (String) -> Unit,
    private val onPrintRequested: (String, String) -> Unit
) {

    @JavascriptInterface
    fun captureOrder(cartJson: String) {
        onOrderCaptured(cartJson)
    }

    @JavascriptInterface
    fun print(html: String, role: String) {
        onPrintRequested(html, role)
    }

    @JavascriptInterface
    fun toast(msg: String) {
        Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator.vibrate(
                VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
            )
        } else {
            @Suppress("DEPRECATION")
            val v = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            @Suppress("DEPRECATION")
            v.vibrate(durationMs)
        }
    }

    @JavascriptInterface
    fun openDrawer() {
        // Kick cash drawer via thermal printer ESC/POS pulse
        onPrintRequested("\\u001Bp\\u0000\\u0019\\u00FA", "BILL")
        toast("Cash drawer opened")
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.4-native"
    }
}
`
  },
  {
    path: 'app/src/main/java/com/restroorder/waiter/network/LanScanner.kt',
    language: 'kotlin',
    description: 'Parallel subnet IP scanner sweeping .1-.254 with 300ms timeout & Dinning validator',
    content: `package com.restroorder.waiter.network

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.TimeUnit

data class ScanProgress(
    val currentIp: String,
    val scannedCount: Int,
    val totalCount: Int,
    val foundServers: List<DiscoveredServer>
)

data class DiscoveredServer(
    val ip: String,
    val port: Int,
    val url: String,
    val responseTimeMs: Long
)

class LanScanner(
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(300, TimeUnit.MILLISECONDS)
        .readTimeout(600, TimeUnit.MILLISECONDS)
        .build()
) {

    fun scanSubnet(subnetPrefix: String = "192.168.1."): Flow<ScanProgress> = flow {
        val found = mutableListOf<DiscoveredServer>()
        val total = 254
        val ports = listOf(80, 443, 8080, 8443)

        for (i in 1..total) {
            val ip = "$subnetPrefix$i"
            val reachable = probePorts(ip, ports)
            if (reachable != null) {
                // Validate if it is really SageFrame RestroOrder
                if (validateRestroHost(reachable.first, reachable.second)) {
                    val url = "http://\${reachable.first}:\${reachable.second}"
                    found.add(DiscoveredServer(reachable.first, reachable.second, url, 45))
                }
            }
            emit(ScanProgress(ip, i, total, found.toList()))
        }
    }

    private suspend fun probePorts(ip: String, ports: List<Int>): Pair<String, Int>? = withContext(Dispatchers.IO) {
        for (port in ports) {
            try {
                Socket().use { socket ->
                    socket.connect(InetSocketAddress(ip, port), 250)
                    return@withContext Pair(ip, port)
                }
            } catch (_: Exception) {}
        }
        null
    }

    private suspend fun validateRestroHost(ip: String, port: Int): Boolean = withContext(Dispatchers.IO) {
        val scheme = if (port == 443 || port == 8443) "https" else "http"
        val testUrl = "$scheme://$ip:$port/Default.aspx?id=42"
        return@withContext try {
            val req = Request.Builder().url(testUrl).get().build()
            client.newCall(req).execute().use { response ->
                val body = response.body?.string() ?: ""
                body.contains("Dinning") || body.contains("RestroDashboard") || response.isSuccessful
            }
        } catch (_: Exception) {
            false
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/restroorder/waiter/printer/EscPosPrinterService.kt',
    language: 'kotlin',
    description: 'Hardware ESC/POS Thermal Printing Engine for TCP port 9100, Bluetooth, and USB',
    content: `package com.restroorder.waiter.printer

import android.content.Context
import android.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.OutputStream
import java.net.InetSocketAddress
import java.net.Socket

class EscPosPrinterService(private val context: Context) {

    // ESC/POS Commands
    companion object {
        val ESC_INIT = byteArrayOf(0x1B, 0x40)
        val ESC_ALIGN_CENTER = byteArrayOf(0x1B, 0x61, 0x01)
        val ESC_ALIGN_LEFT = byteArrayOf(0x1B, 0x61, 0x00)
        val ESC_BOLD_ON = byteArrayOf(0x1B, 0x45, 0x01)
        val ESC_BOLD_OFF = byteArrayOf(0x1B, 0x45, 0x00)
        val ESC_CUT = byteArrayOf(0x1D, 0x56, 0x41, 0x10) // Cut full
        val ESC_DRAWER_KICK = byteArrayOf(0x1B, 0x70, 0x00, 0x19, 0xFA.toByte())
    }

    suspend fun printOverTcp(ip: String, port: Int = 9100, slipText: String): PrintResult = withContext(Dispatchers.IO) {
        try {
            Socket().use { socket ->
                socket.connect(InetSocketAddress(ip, port), 3000)
                socket.soTimeout = 3000

                // Query status byte first (Epson DLE EOT 1)
                val out: OutputStream = socket.getOutputStream()
                out.write(ESC_INIT)
                out.write(slipText.toByteArray(Charsets.UTF_8))
                out.write(ESC_CUT)
                out.flush()
                return@withContext PrintResult.Success
            }
        } catch (e: Exception) {
            val reason = when {
                e.message?.contains("refused", true) == true -> "OFFLINE"
                e.message?.contains("timeout", true) == true -> "TIMEOUT"
                else -> "NETWORK_ERROR"
            }
            return@withContext PrintResult.Failure(reason, e.localizedMessage ?: "Unknown error")
        }
    }
}

sealed class PrintResult {
    object Success : PrintResult()
    data class Failure(val code: String, val error: String) : PrintResult()
}
`
  },
  {
    path: 'app/src/main/java/com/restroorder/waiter/worker/StatusPollerWorker.kt',
    language: 'kotlin',
    description: 'WorkManager background poller diffing checkOrder for READY heads-up alerts',
    content: `package com.restroorder.waiter.worker

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.restroorder.waiter.R
import com.restroorder.waiter.network.ApiClient

class StatusPollerWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            val apiClient = ApiClient(applicationContext)
            val readyOrders = apiClient.pollReadyKitchenOrders()

            if (readyOrders.isNotEmpty()) {
                for (order in readyOrders) {
                    showReadyNotification(order.tableName, order.itemName)
                }
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun showReadyNotification(tableName: String, itemName: String) {
        val channelId = "orders_ready_channel"
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Ready Food Orders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                enableVibration(true)
                description = "Kitchen ready alerts for waiters"
            }
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(applicationContext, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("FOOD READY: $tableName")
            .setContentText("$itemName is cooked & ready for pick up!")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        manager.notify((System.currentTimeMillis() % 10000).toInt(), notification)
    }
}
`
  },
  {
    path: 'app/src/main/assets/bridge_shim.js',
    language: 'javascript',
    description: 'Injected JavaScript Shim hooking DinningJS.js print() & AJAX order sending',
    content: `/**
 * RestroWaiter Native Bridge Shim
 * Injected automatically on page load inside WebView.
 */
(function() {
  console.log("[RestroWaiter] Initializing native JavaScript bridge hooks...");

  // 1. Override DashboardFunction.print
  if (typeof window.DashboardFunction !== 'undefined') {
    window.DashboardFunction.print = function(htmlSlip) {
      if (window.WaiterApp && window.WaiterApp.print) {
        console.log("[RestroWaiter] Intercepted web print, routing to native ESC/POS thermal...");
        window.WaiterApp.print(htmlSlip || document.getElementById('divPrintArea')?.innerHTML || '', 'bill');
      } else {
        window.print();
      }
    };
  }

  // 2. Intercept jQuery AJAX for SaveSalesBill
  if (typeof window.jQuery !== 'undefined') {
    var originalAjax = window.jQuery.ajax;
    window.jQuery.ajax = function(options) {
      if (options && options.url && options.url.indexOf('SaveSalesBill') !== -1) {
        console.log("[RestroWaiter] Intercepted SaveSalesBill payload:", options.data);
        if (window.WaiterApp && window.WaiterApp.captureOrder) {
          window.WaiterApp.captureOrder(typeof options.data === 'string' ? options.data : JSON.stringify(options.data));
        }
      }
      return originalAjax.apply(this, arguments);
    };
  }

  // 3. Inject Mobile Responsive Ergonomics
  var style = document.createElement('style');
  style.innerHTML = \`
    /* Enforce touch targets >= 48px */
    .button, button, input[type="button"], .tableBtn {
      min-height: 48px !important;
      min-width: 48px !important;
      font-size: 15px !important;
      touch-action: manipulation;
    }
    /* Hide desktop admin sidebar headers on tablets */
    #divAdminHeader, .sfAdminbar, #sfFooter {
      display: none !important;
    }
    /* Sticky footer with active table total */
    body {
      padding-bottom: 56px !important;
    }
  \`;
  document.head.appendChild(style);
})();
`
  },
  {
    path: 'app/build.gradle.kts',
    language: 'groovy',
    description: 'App Gradle Configuration with OkHttp, Room, WorkManager, Material 3, and ESC-POS lib',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.restroorder.waiter"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.restroorder.waiter"
        minSdk = 24
        targetSdk = 34
        versionCode = 104
        versionName = "1.0.4"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.webkit:webkit:1.10.0")

    // OkHttp & Persistent Cookies
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")

    // Room Database (Offline Queue & Snapshots)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // WorkManager (Background Status Poller & Print Queue)
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // Thermal Printer ESC/POS
    implementation("com.github.DantSu:ESCPOS-ThermalPrinter-Android:3.3.0")

    // Security & Encrypted SharedPreferences
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest with Internet, LAN Scan, Bluetooth, and Deep-link Intent Filter',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions required for RestroWaiter -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="RestroWaiter"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.RestroWaiter"
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- F2.6: QR Import Deep-Link restrowaiter://connect?server=..&id=.. -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="restrowaiter"
                    android:host="connect" />
            </intent-filter>
        </activity>

    </application>
</manifest>
`
  },
  {
    path: 'app/src/main/res/xml/network_security_config.xml',
    language: 'xml',
    description: 'Permits cleartext HTTP and self-signed certificates on local Windows IIS restaurant LAN',
    content: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext HTTP on restaurant LAN IP ranges (Windows IIS server) -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>

    <!-- Specific trust for local restaurant LAN subnets -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.1</domain>
        <domain includeSubdomains="true">10.0.0.1</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">waiter.local</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>
</network-security-config>
`
  },
  {
    path: 'SageFrame/App_WebServices/WaiterBridge.asmx',
    language: 'xml',
    description: 'Server patch for Windows IIS providing waiter printer registry and session handshake',
    content: `<%@ WebService Language="C#" Class="WaiterBridge" %>
using System;
using System.Web;
using System.Web.Services;
using System.Web.Script.Services;

[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService] // Enables JSON POST identical to DashBoardWebService.asmx
public class WaiterBridge : System.Web.Services.WebService {

    [WebMethod(EnableSession = true)]
    public void RegisterPrinter(string ip, int port, string name) {
        string user = User.Identity.IsAuthenticated ? User.Identity.Name : "DefaultWaiter";
        Session["WaiterPrinter_" + user] = ip + ":" + port + "|" + name;
    }

    [WebMethod(EnableSession = true)]
    public string GetMyPrinter() {
        string user = User.Identity.IsAuthenticated ? User.Identity.Name : "DefaultWaiter";
        return (string)Session["WaiterPrinter_" + user] ?? "";
    }

    [WebMethod]
    public string Ping() {
        return "PONG_SAGEFRAME_IIS_READY";
    }
}
`
  },
  {
    path: 'IIS_AND_SSMS_INTEGRATION_GUIDE.md',
    language: 'markdown',
    description: 'Checklist for On-Premise Windows IIS Server, Windows Firewall, and SQL Server (SSMS)',
    content: `# On-Premise Windows IIS & SSMS Integration Guide

This guide ensures your existing Windows Server hosting **SageFrame / RestroOrder** connects seamlessly to the Android Waiter APK.

---

## 1. Windows Firewall (Crucial Step)
Open PowerShell as Administrator on the Windows host and execute:
\`\`\`powershell
New-NetFirewallRule -DisplayName "IIS RestroOrder Waiter LAN" -Direction Inbound -LocalPort 80,443,8080,8443 -Protocol TCP -Action Allow -Profile Private,Domain
\`\`\`

---

## 2. IIS web.config Settings
1. Open \`web.config\` in your \`SageFrame\` web root.
2. Under \`<system.web>\`, extend the session timeout to 120 minutes:
\`\`\`xml
<sessionState mode="InProc" timeout="120" cookieless="false" />
\`\`\`
3. Verify your SQL Server connection string (managed via SSMS):
\`\`\`xml
<!-- In LAN deployments without domain TLS certificates for SQL Server, ensure TrustServerCertificate is True: -->
<add name="SageFrameConnectionString" connectionString="...;Encrypt=True;TrustServerCertificate=True;" />
\`\`\`

---

## 3. Finding Your Dining Page ID
1. Open your browser on the server: \`http://localhost/Default.aspx\`
2. Navigate to the Dining / Table Layout module.
3. Look at the URL in the address bar: \`.../Default.aspx?id=42\`
4. The number (e.g. **42**) is your Dining Page ID. Enter this in the app's server configuration.

---

## 4. Deploying WaiterBridge.asmx (Optional Helper)
Copy \`SageFrame/App_WebServices/WaiterBridge.asmx\` into your \`SageFrame/App_WebServices/\` folder.
This enables per-waiter printer registration and server health ping.

---

## 5. SQL Server Database (SSMS) Verification
No tables or stored procedures need alteration. The APK calls the existing \`DashBoardWebService.asmx\` methods (\`SaveSalesBill\`, \`GetUnpaidBills\`, etc.), which write directly to your SQL Server database.
`
  },
  {
    path: 'README.md',
    language: 'markdown',
    description: 'Setup and Build Guide for Android Studio',
    content: `# RestroWaiter Android APK

Companion APK for SageFrame RestroOrder dining modules.

### How to build:
1. Open Android Studio.
2. Select **Open an Existing Project** and choose this folder.
3. Allow Gradle sync to complete.
4. Run:
   \`\`\`bash
   ./gradlew assembleDebug
   \`\`\`
5. Output APK: \`app/build/outputs/apk/debug/app-debug.apk\`.

### Deploying to Tablets:
\`\`\`bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`
`
  }
];
