package com.sheomart.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.sheomart.mobile.ui.auth.LoginScreen
import com.sheomart.mobile.ui.theme.SheoMartTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SheoMartTheme {
                LoginScreen()
            }
        }
    }
}