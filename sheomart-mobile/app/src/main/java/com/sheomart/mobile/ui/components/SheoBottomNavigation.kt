package com.sheomart.mobile.ui.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.ui.theme.PrimaryGreen
import com.sheomart.mobile.ui.theme.SecondaryText

enum class CustomerNavTab(
    val route: String,
    val title: String,
    val icon: String
) {
    HOME("home", "Home", "🏠"),
    EXPLORE("explore", "Explore", "🔍"),
    CART("cart", "Cart", "🛒"),
    WISHLIST("wishlist", "Wishlist", "🤍"),
    PROFILE("profile", "Profile", "👤")
}

@Composable
fun SheoBottomNavigation(
    currentTab: CustomerNavTab,
    onTabSelected: (CustomerNavTab) -> Unit
) {
    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp
    ) {
        CustomerNavTab.values().forEach { tab ->
            val isSelected = tab == currentTab
            NavigationBarItem(
                selected = isSelected,
                onClick = { onTabSelected(tab) },
                icon = { Text(text = tab.icon, fontSize = 18.sp) },
                label = {
                    Text(
                        text = tab.title,
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = PrimaryGreen,
                    selectedTextColor = PrimaryGreen,
                    unselectedIconColor = SecondaryText,
                    unselectedTextColor = SecondaryText,
                    indicatorColor = PrimaryGreen.copy(alpha = 0.12f)
                )
            )
        }
    }
}
