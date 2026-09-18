package com.sheomart.mobile.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.sheomart.mobile.auth.AuthState
import com.sheomart.mobile.data.repository.*
import com.sheomart.mobile.ui.addresses.AddressesScreen
import com.sheomart.mobile.ui.addresses.AddressesViewModel
import com.sheomart.mobile.ui.admin.analytics.AdminAnalyticsScreen
import com.sheomart.mobile.ui.admin.analytics.AdminAnalyticsViewModel
import com.sheomart.mobile.ui.admin.categories.AdminCategoriesScreen
import com.sheomart.mobile.ui.admin.categories.AdminCategoriesViewModel
import com.sheomart.mobile.ui.admin.dashboard.AdminDashboardScreen
import com.sheomart.mobile.ui.admin.dashboard.AdminDashboardViewModel
import com.sheomart.mobile.ui.admin.products.AdminProductsScreen
import com.sheomart.mobile.ui.admin.products.AdminProductsViewModel
import com.sheomart.mobile.ui.admin.promotions.AdminPromotionsScreen
import com.sheomart.mobile.ui.admin.promotions.AdminPromotionsViewModel
import com.sheomart.mobile.ui.admin.settings.AdminSettingsScreen
import com.sheomart.mobile.ui.admin.settings.AdminSettingsViewModel
import com.sheomart.mobile.ui.admin.stores.AdminStoresScreen
import com.sheomart.mobile.ui.admin.stores.AdminStoresViewModel
import com.sheomart.mobile.ui.admin.users.AdminUsersScreen
import com.sheomart.mobile.ui.admin.users.AdminUsersViewModel
import com.sheomart.mobile.ui.auth.LoginScreen
import com.sheomart.mobile.ui.auth.RegisterScreen
import com.sheomart.mobile.ui.cart.CartScreen
import com.sheomart.mobile.ui.cart.CartViewModel
import com.sheomart.mobile.ui.category.CategoryProductsScreen
import com.sheomart.mobile.ui.category.CategoryProductsViewModel
import com.sheomart.mobile.ui.checkout.CheckoutScreen
import com.sheomart.mobile.ui.checkout.CheckoutViewModel
import com.sheomart.mobile.ui.components.CustomerNavTab
import com.sheomart.mobile.ui.components.SheoBottomNavigation
import com.sheomart.mobile.ui.dashboard.CustomerDashboardScreen
import com.sheomart.mobile.ui.dashboard.DashboardViewModel
import com.sheomart.mobile.ui.home.HomeScreen
import com.sheomart.mobile.ui.home.HomeViewModel
import com.sheomart.mobile.ui.notifications.NotificationsScreen
import com.sheomart.mobile.ui.notifications.NotificationsViewModel
import com.sheomart.mobile.ui.orders.OrdersScreen
import com.sheomart.mobile.ui.orders.OrdersViewModel
import com.sheomart.mobile.ui.product.ProductDetailScreen
import com.sheomart.mobile.ui.product.ProductDetailViewModel
import com.sheomart.mobile.ui.profile.EditProfileScreen
import com.sheomart.mobile.ui.profile.EditProfileViewModel
import com.sheomart.mobile.ui.search.SearchScreen
import com.sheomart.mobile.ui.search.SearchViewModel
import com.sheomart.mobile.ui.seller.dashboard.SellerDashboardScreen
import com.sheomart.mobile.ui.seller.dashboard.SellerDashboardViewModel
import com.sheomart.mobile.ui.seller.inventory.SellerInventoryScreen
import com.sheomart.mobile.ui.seller.inventory.SellerInventoryViewModel
import com.sheomart.mobile.ui.seller.orders.SellerOrdersScreen
import com.sheomart.mobile.ui.seller.orders.SellerOrdersViewModel
import com.sheomart.mobile.ui.seller.products.SellerProductsScreen
import com.sheomart.mobile.ui.seller.products.SellerProductsViewModel
import com.sheomart.mobile.ui.theme.Background
import com.sheomart.mobile.ui.theme.PrimaryGreen
import com.sheomart.mobile.ui.theme.SecondaryText
import com.sheomart.mobile.ui.wishlist.WishlistScreen
import com.sheomart.mobile.ui.wishlist.WishlistViewModel
import com.sheomart.mobile.utils.SecureTokenStore

@Composable
fun AppNavigation(auth: AuthState) {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val tokenStore = remember { SecureTokenStore(context) }

    // Repositories
    val homeRepository = remember { HomeRepository(tokenStore) }
    val dashboardRepository = remember { DashboardRepository(tokenStore) }
    val productRepository = remember { ProductRepository(tokenStore) }
    val cartRepository = remember { CartRepository(tokenStore) }
    val wishlistRepository = remember { WishlistRepository(tokenStore) }
    val ordersRepository = remember { OrdersRepository(tokenStore) }
    val addressesRepository = remember { AddressesRepository(tokenStore) }
    val userRepository = remember { UserRepository(tokenStore) }
    val sellerRepository = remember { SellerRepository(tokenStore) }
    val adminRepository = remember { AdminRepository(tokenStore) }

    // Customer ViewModels
    val homeViewModel = remember { HomeViewModel(homeRepository) }
    val dashboardViewModel = remember { DashboardViewModel(dashboardRepository) }
    val searchViewModel = remember { SearchViewModel(productRepository) }
    val cartViewModel = remember { CartViewModel(cartRepository) }
    val wishlistViewModel = remember { WishlistViewModel(wishlistRepository, cartRepository) }
    val ordersViewModel = remember { OrdersViewModel(ordersRepository) }
    val addressesViewModel = remember { AddressesViewModel(addressesRepository) }
    val notificationsViewModel = remember { NotificationsViewModel() }
    val editProfileViewModel = remember { EditProfileViewModel(userRepository) }
    val checkoutViewModel = remember { CheckoutViewModel(cartRepository, addressesRepository, ordersRepository) }
    val productDetailViewModel = remember { ProductDetailViewModel(productRepository, cartRepository, wishlistRepository) }
    val categoryProductsViewModel = remember { CategoryProductsViewModel(productRepository, cartRepository, wishlistRepository) }

    // Seller ViewModels
    val sellerDashboardViewModel = remember { SellerDashboardViewModel(sellerRepository) }
    val sellerProductsViewModel = remember { SellerProductsViewModel(sellerRepository) }
    val sellerOrdersViewModel = remember { SellerOrdersViewModel(sellerRepository) }
    val sellerInventoryViewModel = remember { SellerInventoryViewModel(sellerRepository) }

    // Admin ViewModels
    val adminDashboardViewModel = remember { AdminDashboardViewModel(adminRepository) }
    val adminStoresViewModel = remember { AdminStoresViewModel(adminRepository) }
    val adminCategoriesViewModel = remember { AdminCategoriesViewModel(adminRepository) }
    val adminProductsViewModel = remember { AdminProductsViewModel(adminRepository) }
    val adminPromotionsViewModel = remember { AdminPromotionsViewModel(adminRepository) }
    val adminUsersViewModel = remember { AdminUsersViewModel(adminRepository) }
    val adminAnalyticsViewModel = remember { AdminAnalyticsViewModel(adminRepository) }
    val adminSettingsViewModel = remember { AdminSettingsViewModel(adminRepository) }

    LaunchedEffect(Unit) { auth.restore(scope) }

    if (auth.loading && auth.user == null) return

    val start = when {
        auth.user == null -> Routes.Login
        auth.user?.role.equals("platform_admin", ignoreCase = true) -> Routes.AdminDashboard
        auth.user?.role.equals("store_owner", ignoreCase = true) -> Routes.SellerDashboard
        else -> Routes.Home
    }

    val navigateToTab: (CustomerNavTab) -> Unit = { tab ->
        navController.navigate(tab.route) {
            popUpTo(Routes.Home) {
                saveState = true
            }
            launchSingleTop = true
            restoreState = true
        }
    }

    NavHost(navController = navController, startDestination = start) {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        composable(Routes.Login) {
            LoginScreen(
                error = auth.error,
                loading = auth.loading,
                onLogin = { identifier, password ->
                    auth.login(scope, identifier, password) {
                        val destination = when {
                            auth.user?.role.equals("platform_admin", ignoreCase = true) -> Routes.AdminDashboard
                            auth.user?.role.equals("store_owner", ignoreCase = true) -> Routes.SellerDashboard
                            else -> Routes.Home
                        }
                        navController.navigate(destination) {
                            popUpTo(Routes.Login) { inclusive = true }
                        }
                    }
                },
                onRegister = { navController.navigate(Routes.Register) },
            )
        }

        composable(Routes.Register) {
            RegisterScreen(
                error = auth.error,
                loading = auth.loading,
                onRegister = { request ->
                    auth.register(scope, request) {
                        navController.navigate(Routes.Home) {
                            popUpTo(Routes.Register) { inclusive = true }
                        }
                    }
                },
                onLogin = { navController.popBackStack() },
            )
        }

        // ==========================================
        // 5 MAIN CUSTOMER TABS
        // ==========================================

        composable(Routes.Home) {
            HomeScreen(
                user = auth.user,
                viewModel = homeViewModel,
                onNavigateTab = navigateToTab,
                onSearchClick = { navController.navigate(Routes.Search) },
                onCategoryClick = { categoryId -> navController.navigate(Routes.category(categoryId)) },
                onProductClick = { productId -> navController.navigate(Routes.product(productId)) },
                onStoreClick = { storeId -> navController.navigate(Routes.store(storeId)) },
                onNotificationsClick = { navController.navigate(Routes.Notifications) },
                onProfileClick = { navigateToTab(CustomerNavTab.PROFILE) },
                onOrdersClick = { navController.navigate(Routes.Orders) }
            )
        }

        composable(Routes.Explore) {
            SearchScreen(
                viewModel = searchViewModel,
                onBack = { navigateToTab(CustomerNavTab.HOME) },
                onProductClick = { productId -> navController.navigate(Routes.product(productId)) },
                onStoreClick = { storeId -> navController.navigate(Routes.store(storeId)) },
                onCategoryClick = { categoryId -> navController.navigate(Routes.category(categoryId)) }
            )
        }

        composable(Routes.Cart) {
            CartScreen(
                viewModel = cartViewModel,
                onNavigateTab = navigateToTab,
                onProductClick = { productId -> navController.navigate(Routes.product(productId)) },
                onCheckoutClick = { navController.navigate(Routes.Checkout) }
            )
        }

        composable(Routes.Wishlist) {
            WishlistScreen(
                viewModel = wishlistViewModel,
                onNavigateTab = navigateToTab,
                onProductClick = { productId -> navController.navigate(Routes.product(productId)) }
            )
        }

        composable(Routes.Profile) {
            CustomerDashboardScreen(
                user = auth.user,
                viewModel = dashboardViewModel,
                onNavigateTab = navigateToTab,
                onOrdersClick = { navController.navigate(Routes.Orders) },
                onWishlistClick = { navigateToTab(CustomerNavTab.WISHLIST) },
                onCartClick = { navigateToTab(CustomerNavTab.CART) },
                onAddressesClick = { navController.navigate(Routes.Addresses) },
                onCouponsClick = { navController.navigate(Routes.Coupons) },
                onNotificationsClick = { navController.navigate(Routes.Notifications) },
                onSupportClick = { navController.navigate(Routes.Support) },
                onAboutClick = { navController.navigate(Routes.About) },
                onEditProfileClick = { navController.navigate(Routes.EditProfile) },
                onExploreClick = { navigateToTab(CustomerNavTab.EXPLORE) },
                onLogout = {
                    auth.logout()
                    navController.navigate(Routes.Login) { popUpTo(0) }
                }
            )
        }

        // ==========================================
        // CUSTOMER SUB-DESTINATIONS
        // ==========================================

        composable(Routes.Search) {
            SearchScreen(
                viewModel = searchViewModel,
                onBack = { navController.popBackStack() },
                onProductClick = { productId -> navController.navigate(Routes.product(productId)) },
                onStoreClick = { storeId -> navController.navigate(Routes.store(storeId)) },
                onCategoryClick = { categoryId -> navController.navigate(Routes.category(categoryId)) }
            )
        }

        composable(
            route = Routes.CategoryRoute,
            arguments = listOf(navArgument("categoryId") { type = NavType.StringType })
        ) { backStackEntry ->
            val categoryId = backStackEntry.arguments?.getString("categoryId") ?: ""
            CategoryProductsScreen(
                categoryId = categoryId,
                viewModel = categoryProductsViewModel,
                onBack = { navController.popBackStack() },
                onProductClick = { productId -> navController.navigate(Routes.product(productId)) }
            )
        }

        composable(
            route = Routes.ProductRoute,
            arguments = listOf(navArgument("productId") { type = NavType.StringType })
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            ProductDetailScreen(
                productId = productId,
                viewModel = productDetailViewModel,
                onBack = { navController.popBackStack() },
                onNavigateCart = { navigateToTab(CustomerNavTab.CART) },
                onStoreClick = { storeId -> navController.navigate(Routes.store(storeId)) }
            )
        }

        composable(
            route = Routes.StoreRoute,
            arguments = listOf(navArgument("storeId") { type = NavType.StringType })
        ) { backStackEntry ->
            val storeId = backStackEntry.arguments?.getString("storeId") ?: ""
            DetailPlaceholderScreen(
                title = "Store Details",
                subtitle = "Viewing local store catalog for: $storeId",
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.Checkout) {
            CheckoutScreen(
                viewModel = checkoutViewModel,
                onBack = { navController.popBackStack() },
                onManageAddresses = { navController.navigate(Routes.Addresses) },
                onOrderSuccess = { orderId ->
                    navController.navigate(Routes.Orders) {
                        popUpTo(Routes.Home)
                    }
                }
            )
        }

        composable(Routes.Orders) {
            OrdersScreen(
                viewModel = ordersViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.Addresses) {
            AddressesScreen(
                viewModel = addressesViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.Coupons) {
            DetailPlaceholderScreen(
                title = "Coupons & Offers",
                subtitle = "Apply promo code SHEOPUR20 for 20% festival discount during checkout.",
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.Notifications) {
            NotificationsScreen(
                viewModel = notificationsViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.Support) {
            DetailPlaceholderScreen(
                title = "Help & Support",
                subtitle = "Direct customer support for orders and doorstep delivery. WhatsApp support: +91 98765 43210",
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.About) {
            DetailPlaceholderScreen(
                title = "About SheoMart",
                subtitle = "SheoMart connects neighborhood stores across Sheopur district with fast delivery and calm shopping.",
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.EditProfile) {
            EditProfileScreen(
                viewModel = editProfileViewModel,
                currentUser = auth.user,
                onBack = { navController.popBackStack() }
            )
        }

        // ==========================================
        // SELLER MERCHANT WORKSPACE
        // ==========================================

        composable(Routes.SellerDashboard) {
            SellerDashboardScreen(
                user = auth.user,
                viewModel = sellerDashboardViewModel,
                onNavigateProducts = { navController.navigate(Routes.SellerProducts) },
                onNavigateOrders = { navController.navigate(Routes.SellerOrders) },
                onNavigateInventory = { navController.navigate(Routes.SellerInventory) },
                onLogout = {
                    auth.logout()
                    navController.navigate(Routes.Login) { popUpTo(0) }
                }
            )
        }

        composable(Routes.SellerProducts) {
            SellerProductsScreen(
                viewModel = sellerProductsViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.SellerOrders) {
            SellerOrdersScreen(
                viewModel = sellerOrdersViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.SellerInventory) {
            SellerInventoryScreen(
                viewModel = sellerInventoryViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        // ==========================================
        // ADMIN CONTROL CENTER WORKSPACE
        // ==========================================

        composable(Routes.AdminDashboard) {
            AdminDashboardScreen(
                user = auth.user,
                viewModel = adminDashboardViewModel,
                onNavigateStores = { navController.navigate(Routes.AdminStores) },
                onNavigateProducts = { navController.navigate(Routes.AdminProducts) },
                onNavigateCategories = { navController.navigate(Routes.AdminCategories) },
                onNavigateCoupons = {
                    adminPromotionsViewModel.selectTab(0)
                    navController.navigate(Routes.AdminCoupons)
                },
                onNavigateOffers = {
                    adminPromotionsViewModel.selectTab(1)
                    navController.navigate(Routes.AdminOffers)
                },
                onNavigateUsers = { navController.navigate(Routes.AdminUsers) },
                onNavigateAnalytics = { navController.navigate(Routes.AdminAnalytics) },
                onNavigateSettings = { navController.navigate(Routes.AdminSettings) },
                onLogout = {
                    auth.logout()
                    navController.navigate(Routes.Login) { popUpTo(0) }
                }
            )
        }

        composable(Routes.AdminStores) {
            AdminStoresScreen(
                viewModel = adminStoresViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.AdminCategories) {
            AdminCategoriesScreen(
                viewModel = adminCategoriesViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.AdminProducts) {
            AdminProductsScreen(
                viewModel = adminProductsViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.AdminCoupons) {
            AdminPromotionsScreen(
                viewModel = adminPromotionsViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.AdminOffers) {
            AdminPromotionsScreen(
                viewModel = adminPromotionsViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.AdminUsers) {
            AdminUsersScreen(
                viewModel = adminUsersViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.AdminAnalytics) {
            AdminAnalyticsScreen(
                viewModel = adminAnalyticsViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.AdminSettings) {
            AdminSettingsScreen(
                user = auth.user,
                viewModel = adminSettingsViewModel,
                onBack = { navController.popBackStack() },
                onLogout = {
                    auth.logout()
                    navController.navigate(Routes.Login) { popUpTo(0) }
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DetailPlaceholderScreen(
    title: String,
    subtitle: String,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title, style = MaterialTheme.typography.titleMedium) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, color = PrimaryGreen)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = SecondaryText
            )
        }
    }
}