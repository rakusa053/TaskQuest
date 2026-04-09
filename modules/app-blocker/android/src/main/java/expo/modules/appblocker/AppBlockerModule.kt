package expo.modules.appblocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {

  private val ctx get() = requireNotNull(appContext.reactContext)

  companion object {
    /** AppBlockerService から直接呼び出してイベントを JS に送る */
    var emitBlockDetected: (() -> Unit)? = null
  }

  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    Events("onBlockDetected")

    // サービスからイベントを送るためのコールバックを登録
    OnCreate {
      emitBlockDetected = { sendEvent("onBlockDetected", mapOf<String, Any>()) }
    }
    OnDestroy {
      emitBlockDetected = null
    }

    /** UsageStats 権限があるか */
    Function("hasUsagePermission") {
      hasUsagePermission()
    }

    /** 「他のアプリの上に表示」権限があるか（Android 10+ のバックグラウンド起動に必要） */
    Function("canDrawOverlays") {
      Settings.canDrawOverlays(ctx)
    }

    /** 「他のアプリの上に表示」設定画面を開く */
    Function("openOverlaySettings") {
      ctx.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
        data = android.net.Uri.parse("package:${ctx.packageName}")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      })
    }

    /** 使用状況アクセス設定画面を開く（Android 10+ はアプリ個別ページに直接遷移） */
    Function("openUsageSettings") {
      val fallbackIntent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        try {
          ctx.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            data = android.net.Uri.parse("package:${ctx.packageName}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
          })
        } catch (e: Exception) {
          ctx.startActivity(fallbackIntent)
        }
      } else {
        ctx.startActivity(fallbackIntent)
      }
    }

    /** インストール済みの起動可能アプリ一覧（自アプリを除く） */
    Function("getInstalledApps") {
      val pm = ctx.packageManager
      val launchIntent = Intent(Intent.ACTION_MAIN, null).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
      }
      pm.queryIntentActivities(launchIntent, 0)
        .filter { it.activityInfo.packageName != ctx.packageName }
        .map { mapOf("packageName" to it.activityInfo.packageName, "appName" to it.loadLabel(pm).toString()) }
        .sortedBy { it["appName"] as String }
    }

    /** ブロック対象パッケージを指定してフォアグラウンド監視サービスを開始 */
    Function("startMonitoring") { blockedPackages: List<String> ->
      Log.d("AppBlocker", "startMonitoring called: $blockedPackages SDK=${Build.VERSION.SDK_INT}")
      try {
        val intent = Intent(ctx, AppBlockerService::class.java).apply {
          putStringArrayListExtra("blockedPackages", ArrayList(blockedPackages))
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          ctx.startForegroundService(intent)
        } else {
          ctx.startService(intent)
        }
        Log.d("AppBlocker", "startMonitoring success")
      } catch (e: Exception) {
        Log.e("AppBlocker", "startMonitoring FAILED: ${e::class.simpleName}: ${e.message}", e)
        throw e
      }
    }

    /** 監視サービスを停止 */
    Function("stopMonitoring") {
      Log.d("AppBlocker", "stopMonitoring called")
      try {
        ctx.stopService(Intent(ctx, AppBlockerService::class.java))
        Log.d("AppBlocker", "stopMonitoring success")
      } catch (e: Exception) {
        Log.e("AppBlocker", "stopMonitoring FAILED: ${e::class.simpleName}: ${e.message}", e)
        throw e
      }
    }

    /** 現在の解放期限（Unix ms）を返す。0 なら解放中ではない */
    Function("getUnlockExpiry") {
      ctx.getSharedPreferences("gamingtask_blocker", Context.MODE_PRIVATE)
        .getLong("unlock_expires_at", 0L)
    }

    /**
     * ガチャ報酬の解放期限を SharedPreferences に保存する。
     * AppBlockerService がこの値を参照してブロックをスキップする。
     */
    Function("setUnlockExpiry") { expiresAt: Long ->
      Log.d("AppBlocker", "setUnlockExpiry: $expiresAt")
      ctx.getSharedPreferences("gamingtask_blocker", Context.MODE_PRIVATE)
        .edit().putLong("unlock_expires_at", expiresAt).apply()
    }

    /**
     * SharedPreferences に show_lock フラグが立っているか確認。
     * 立っていれば true を返してフラグをクリアする。
     * AppState active 時に React Native から呼ぶ。
     */
    Function("checkPendingLock") {
      val prefs = ctx.getSharedPreferences("gamingtask_blocker", Context.MODE_PRIVATE)
      val pending = prefs.getBoolean("show_lock", false)
      if (pending) prefs.edit().putBoolean("show_lock", false).apply()
      pending
    }
  }

  private fun hasUsagePermission(): Boolean {
    val appOps = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }
}
