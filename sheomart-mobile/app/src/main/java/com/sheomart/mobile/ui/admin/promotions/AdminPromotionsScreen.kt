package com.sheomart.mobile.ui.admin.promotions

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.AdminCouponItem
import com.sheomart.mobile.data.model.AdminOfferItem
import com.sheomart.mobile.ui.admin.components.AdminConfirmDialog
import com.sheomart.mobile.ui.admin.components.AdminSearchBar
import com.sheomart.mobile.ui.admin.components.AdminTopAppBar
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@Composable
fun AdminPromotionsScreen(
    viewModel: AdminPromotionsViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.feedbackMessage) {
        uiState.feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.dismissFeedback()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            AdminTopAppBar(
                title = "Promotions & Discounts",
                subtitle = "Manage platform coupons & festival campaigns",
                onBack = onBack,
                actions = {
                    Button(
                        onClick = { viewModel.openCreateDialog() },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Text(
                            text = if (uiState.selectedTab == 0) "+ Coupon" else "+ Offer",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            )
        },
        containerColor = Background,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Tab Selector
            TabRow(
                selectedTabIndex = uiState.selectedTab,
                containerColor = Color.White,
                contentColor = PrimaryGreen
            ) {
                Tab(
                    selected = uiState.selectedTab == 0,
                    onClick = { viewModel.selectTab(0) },
                    text = { Text("🏷️ Coupons", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = uiState.selectedTab == 1,
                    onClick = { viewModel.selectTab(1) },
                    text = { Text("🎉 Festival Offers", fontWeight = FontWeight.Bold) }
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                AdminSearchBar(
                    query = uiState.searchQuery,
                    onQueryChange = { viewModel.onSearchChange(it) },
                    placeholder = if (uiState.selectedTab == 0) "Search coupons by code or title..." else "Search festival offers by title..."
                )
            }

            // Tab Content
            if (uiState.selectedTab == 0) {
                // COUPONS LIST
                when (val state = uiState.couponsState) {
                    is UiState.Loading -> {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            repeat(4) { ShimmerPlaceholder(modifier = Modifier.fillMaxWidth().height(120.dp), shape = RoundedCornerShape(18.dp)) }
                        }
                    }
                    is UiState.Success -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(state.data, key = { it.couponId }) { coupon ->
                                CouponAdminCard(
                                    coupon = coupon,
                                    onDelete = { viewModel.requestDeleteCoupon(coupon) }
                                )
                            }
                            item { Spacer(modifier = Modifier.height(24.dp)) }
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                            SectionEmptyView(title = "No coupons found", description = "Create your first discount coupon code.")
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                            SectionErrorView(message = state.message, onRetry = { viewModel.loadAll() })
                        }
                    }
                }
            } else {
                // OFFERS LIST
                when (val state = uiState.offersState) {
                    is UiState.Loading -> {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            repeat(3) { ShimmerPlaceholder(modifier = Modifier.fillMaxWidth().height(140.dp), shape = RoundedCornerShape(18.dp)) }
                        }
                    }
                    is UiState.Success -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(state.data, key = { it.offerId }) { offer ->
                                OfferAdminCard(
                                    offer = offer,
                                    onDelete = { viewModel.requestDeleteOffer(offer) }
                                )
                            }
                            item { Spacer(modifier = Modifier.height(24.dp)) }
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                            SectionEmptyView(title = "No festival offers found", description = "Schedule seasonal discount campaigns for shoppers.")
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                            SectionErrorView(message = state.message, onRetry = { viewModel.loadAll() })
                        }
                    }
                }
            }
        }
    }

    // Create Coupon Dialog
    if (uiState.isCreateCouponOpen) {
        CreateCouponDialog(
            isSubmitting = uiState.isSubmitting,
            onSave = { title, code, type, valDisc, minCart, maxDisc, usage, once, start, end, active ->
                viewModel.createCoupon(title, code, type, valDisc, minCart, maxDisc, usage, once, start, end, active)
            },
            onDismiss = { viewModel.closeDialogs() }
        )
    }

    // Create Offer Dialog
    if (uiState.isCreateOfferOpen) {
        CreateOfferDialog(
            categories = uiState.categories,
            isSubmitting = uiState.isSubmitting,
            onSave = { title, fest, type, valDisc, catIds, banner, priority, start, end, active ->
                viewModel.createOffer(title, fest, type, valDisc, catIds, banner, priority, start, end, active)
            },
            onDismiss = { viewModel.closeDialogs() }
        )
    }

    // Delete Coupon Dialog
    if (uiState.pendingDeleteCoupon != null) {
        val c = uiState.pendingDeleteCoupon!!
        AdminConfirmDialog(
            title = "Deactivate Coupon '${c.code}'?",
            description = "Shoppers will no longer be able to apply this discount code at checkout.",
            confirmText = "Deactivate",
            confirmColor = Error,
            onConfirm = { viewModel.confirmDeleteCoupon() },
            onDismiss = { viewModel.dismissDeleteCoupon() }
        )
    }

    // Delete Offer Dialog
    if (uiState.pendingDeleteOffer != null) {
        val o = uiState.pendingDeleteOffer!!
        AdminConfirmDialog(
            title = "Deactivate Offer '${o.title}'?",
            description = "This festival banner campaign will be removed from customer homepages.",
            confirmText = "Deactivate",
            confirmColor = Error,
            onConfirm = { viewModel.confirmDeleteOffer() },
            onDismiss = { viewModel.dismissDeleteOffer() }
        )
    }
}

@Composable
private fun CouponAdminCard(
    coupon: AdminCouponItem,
    onDelete: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(2.dp, shape = RoundedCornerShape(18.dp), spotColor = Color(0x14000000))
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(18.dp))
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFECFDF5))
                                .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(8.dp))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = coupon.code,
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.sp,
                                    color = Color(0xFF047857)
                                )
                            )
                        }

                        Text(
                            text = coupon.displayDiscount,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = PrimaryGreen,
                                fontSize = 15.sp
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = coupon.title,
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                        color = PrimaryText
                    )
                }

                IconButton(onClick = onDelete) {
                    Text("🗑️", fontSize = 16.sp)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Min ₹${coupon.minimumCartValue.toInt()}${if (coupon.usageLimit != null) " · Limit: ${coupon.usageLimit}" else ""}",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                    color = SecondaryText
                )
                Text(
                    text = "Used: ${coupon.usageCount} times",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = PrimaryText)
                )
            }
        }
    }
}

@Composable
private fun OfferAdminCard(
    offer: AdminOfferItem,
    onDelete: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(2.dp, shape = RoundedCornerShape(18.dp), spotColor = Color(0x14000000))
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(18.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Surface),
                contentAlignment = Alignment.Center
            ) {
                if (!offer.bannerImage.isNullOrBlank()) {
                    AsyncImageLoader(
                        url = offer.bannerImage,
                        contentDescription = offer.title,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Text(text = "🎉", fontSize = 24.sp)
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = offer.title,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = onDelete, modifier = Modifier.size(28.dp)) {
                        Text("🗑️", fontSize = 14.sp)
                    }
                }

                if (!offer.festivalName.isNullOrBlank()) {
                    Text(
                        text = "Festival: ${offer.festivalName}",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                        color = SecondaryText
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = offer.displayDiscount,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = PrimaryGreen)
                    )
                    Text(
                        text = "Priority: ${offer.priority}",
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, color = SecondaryText)
                    )
                }
            }
        }
    }
}

@Composable
private fun CreateCouponDialog(
    isSubmitting: Boolean,
    onSave: (
        title: String,
        code: String,
        discountType: String,
        discountValue: Double,
        minimumCartValue: Double,
        maximumDiscount: Double?,
        usageLimit: Int?,
        oncePerCustomer: Boolean,
        startsAt: String,
        endsAt: String,
        isActive: Boolean
    ) -> Unit,
    onDismiss: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var discountType by remember { mutableStateOf("percentage") }
    var discountValue by remember { mutableStateOf("10") }
    var minimumCartValue by remember { mutableStateOf("100") }
    var usageLimit by remember { mutableStateOf("") }
    var oncePerCustomer by remember { mutableStateOf(true) }
    var errorText by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Create Discount Coupon", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it.uppercase(); errorText = null },
                    label = { Text("Coupon Code * (e.g. FESTIVAL20)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it; errorText = null },
                    label = { Text("Display Title *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = discountValue,
                        onValueChange = { discountValue = it },
                        label = { Text("Discount Value *") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = minimumCartValue,
                        onValueChange = { minimumCartValue = it },
                        label = { Text("Min Cart (₹)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                OutlinedTextField(
                    value = usageLimit,
                    onValueChange = { usageLimit = it.filter { c -> c.isDigit() } },
                    label = { Text("Usage Limit (optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                if (errorText != null) {
                    Text(errorText!!, color = Error, style = MaterialTheme.typography.bodySmall)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (code.trim().isBlank() || title.trim().isBlank()) {
                        errorText = "Coupon code and title are required"
                        return@Button
                    }
                    val dVal = discountValue.toDoubleOrNull() ?: 10.0
                    val minCart = minimumCartValue.toDoubleOrNull() ?: 0.0
                    val limit = usageLimit.toIntOrNull()
                    val now = Date()
                    val cal = Calendar.getInstance()
                    cal.add(Calendar.DAY_OF_YEAR, 30)
                    val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)

                    onSave(
                        title.trim(), code.trim(), discountType, dVal, minCart,
                        null, limit, oncePerCustomer, sdf.format(now), sdf.format(cal.time), true
                    )
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text(if (isSubmitting) "Saving..." else "Create Coupon", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss, shape = RoundedCornerShape(10.dp)) {
                Text("Cancel", color = PrimaryText)
            }
        },
        shape = RoundedCornerShape(20.dp),
        containerColor = Color.White
    )
}

@Composable
private fun CreateOfferDialog(
    categories: List<com.sheomart.mobile.data.model.AdminCategoryItem>,
    isSubmitting: Boolean,
    onSave: (
        title: String,
        festivalName: String,
        discountType: String,
        discountValue: Double,
        categoryIds: List<String>,
        bannerImage: String,
        priority: Int,
        startsAt: String,
        endsAt: String,
        isActive: Boolean
    ) -> Unit,
    onDismiss: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var festivalName by remember { mutableStateOf("") }
    var discountValue by remember { mutableStateOf("15") }
    var bannerImage by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf("1") }
    var errorText by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Create Festival Offer", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it; errorText = null },
                    label = { Text("Offer Title *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = festivalName,
                    onValueChange = { festivalName = it },
                    label = { Text("Festival Name (e.g. Diwali Mega)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = discountValue,
                        onValueChange = { discountValue = it },
                        label = { Text("Discount %") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = priority,
                        onValueChange = { priority = it.filter { c -> c.isDigit() } },
                        label = { Text("Priority (0-10)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                OutlinedTextField(
                    value = bannerImage,
                    onValueChange = { bannerImage = it },
                    label = { Text("Banner Image URL") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                if (errorText != null) {
                    Text(errorText!!, color = Error, style = MaterialTheme.typography.bodySmall)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.trim().isBlank()) {
                        errorText = "Offer title is required"
                        return@Button
                    }
                    val dVal = discountValue.toDoubleOrNull() ?: 15.0
                    val prio = priority.toIntOrNull() ?: 1
                    val now = Date()
                    val cal = Calendar.getInstance()
                    cal.add(Calendar.DAY_OF_YEAR, 30)
                    val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)

                    onSave(
                        title.trim(), festivalName.trim(), "percentage", dVal,
                        emptyList(), bannerImage.trim(), prio, sdf.format(now), sdf.format(cal.time), true
                    )
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text(if (isSubmitting) "Saving..." else "Create Offer", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss, shape = RoundedCornerShape(10.dp)) {
                Text("Cancel", color = PrimaryText)
            }
        },
        shape = RoundedCornerShape(20.dp),
        containerColor = Color.White
    )
}
