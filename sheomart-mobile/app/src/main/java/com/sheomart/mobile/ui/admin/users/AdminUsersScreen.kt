package com.sheomart.mobile.ui.admin.users

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import com.sheomart.mobile.data.model.AdminUserItem
import com.sheomart.mobile.ui.admin.components.AdminFilterChip
import com.sheomart.mobile.ui.admin.components.AdminSearchBar
import com.sheomart.mobile.ui.admin.components.AdminTopAppBar
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@Composable
fun AdminUsersScreen(
    viewModel: AdminUsersViewModel,
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
                title = "User Accounts",
                subtitle = "Platform customers, sellers & admin accounts",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { viewModel.loadUsers() }) {
                        Text(text = "🔄", fontSize = 16.sp)
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
            // Search & Role filters
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                AdminSearchBar(
                    query = uiState.searchQuery,
                    onQueryChange = { viewModel.onSearchChange(it) },
                    placeholder = "Search name, email, mobile, ID..."
                )

                Spacer(modifier = Modifier.height(10.dp))

                val roleFilters = listOf(
                    null to "All Accounts",
                    "customer" to "Customers",
                    "store_owner" to "Store Owners",
                    "platform_admin" to "Admins"
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    roleFilters.forEach { (roleKey, label) ->
                        AdminFilterChip(
                            selected = uiState.selectedRole == roleKey,
                            label = label,
                            onClick = { viewModel.onRoleChange(roleKey) }
                        )
                    }
                }
            }

            // Users list
            when (val state = uiState.usersState) {
                is UiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        repeat(5) {
                            ShimmerPlaceholder(
                                modifier = Modifier.fillMaxWidth().height(100.dp),
                                shape = RoundedCornerShape(18.dp)
                            )
                        }
                    }
                }
                is UiState.Success -> {
                    LazyColumn(
                        modifier = Modifier.weight(1f).fillMaxWidth(),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.data, key = { it.userId }) { user ->
                            AdminUserCard(user = user)
                        }
                        item {
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }

                    // Pagination bar
                    if (uiState.pagination.totalPages > 1) {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shadowElevation = 4.dp,
                            color = Color.White
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 20.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Page ${uiState.currentPage} of ${uiState.pagination.totalPages} (${uiState.pagination.total} users)",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = SecondaryText
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    OutlinedButton(
                                        onClick = { viewModel.previousPage() },
                                        enabled = uiState.currentPage > 1,
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                    ) {
                                        Text("Prev", fontSize = 12.sp)
                                    }
                                    OutlinedButton(
                                        onClick = { viewModel.nextPage() },
                                        enabled = uiState.currentPage < uiState.pagination.totalPages,
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                    ) {
                                        Text("Next", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
                is UiState.Empty -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionEmptyView(
                            title = "No users found",
                            description = "No accounts match the current search and role filters."
                        )
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadUsers() }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminUserCard(user: AdminUserItem) {
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
            // Avatar
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(
                        when (user.role.lowercase()) {
                            "platform_admin" -> PrimaryGreen
                            "store_owner" -> Color(0xFFD97706)
                            else -> Color(0xFF6B7280)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = user.name.take(1).uppercase(),
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Color.White)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = user.name,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, fontSize = 14.sp),
                        color = PrimaryText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    // Role pill
                    val (roleBg, roleFg, roleText) = when (user.role.lowercase()) {
                        "platform_admin" -> Triple(Color(0xFFECFDF5), Color(0xFF047857), "Admin")
                        "store_owner" -> Triple(Color(0xFFFEF3C7), Color(0xFFB45309), "Seller")
                        else -> Triple(Color(0xFFF3F4F6), Color(0xFF4B5563), "Customer")
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(roleBg)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(text = roleText, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = roleFg)
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                if (user.email.isNotBlank()) {
                    Text(
                        text = "✉️ ${user.email}",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                        color = SecondaryText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                if (user.mobile.isNotBlank()) {
                    Text(
                        text = "📱 ${user.mobile}",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                        color = SecondaryText
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (user.emailVerified) {
                        Text("✓ Email", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF047857))
                    }
                    if (user.phoneVerified) {
                        Text("✓ Phone", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF047857))
                    }
                    Text(
                        text = if (user.isActive) "• Active" else "• Inactive",
                        fontSize = 10.sp,
                        color = if (user.isActive) PrimaryGreen else Error
                    )
                }
            }
        }
    }
}
