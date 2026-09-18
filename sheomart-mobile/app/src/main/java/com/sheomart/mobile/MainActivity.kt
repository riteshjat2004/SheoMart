package com.sheomart.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.remember
import com.sheomart.mobile.auth.AuthState
import com.sheomart.mobile.navigation.AppNavigation
import com.sheomart.mobile.ui.theme.SheoMartTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SheoMartTheme {
                val auth = remember { AuthState(applicationContext) }
                AppNavigation(auth)
            }
        }
    }
}