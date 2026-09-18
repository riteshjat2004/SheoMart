package com.sheomart.mobile.ui.admin.categories

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.sheomart.mobile.data.model.AdminCategoryItem
import com.sheomart.mobile.ui.admin.components.AdminConfirmDialog
import com.sheomart.mobile.ui.admin.components.AdminSearchBar
import com.sheomart.mobile.ui.admin.components.AdminTopAppBar
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@Composable
fun AdminCategoriesScreen(
    viewModel: AdminCategoriesViewModel,
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
                title = "Category Taxonomy",
                subtitle = "Manage marketplace catalog categories",
                onBack = onBack,
                actions = {
                    Button(
                        onClick = { viewModel.openCreateModal() },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Text("+ New", fontWeight = FontWeight.Bold, fontSize = 13.sp)
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
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                AdminSearchBar(
                    query = uiState.searchQuery,
                    onQueryChange = { viewModel.onSearchChange(it) },
                    placeholder = "Search categories by name or description..."
                )
            }

            when (val state = uiState.categoriesState) {
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
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.data, key = { it.categoryId }) { category ->
                            CategoryAdminCard(
                                category = category,
                                onToggleStatus = { viewModel.toggleCategoryStatus(category) },
                                onEdit = { viewModel.openEditModal(category) },
                                onDelete = { viewModel.requestDelete(category) }
                            )
                        }
                        item {
                            Spacer(modifier = Modifier.height(24.dp))
                        }
                    }
                }
                is UiState.Empty -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionEmptyView(
                            title = "No categories found",
                            description = "Add a new category or try adjusting your search."
                        )
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadCategories() }
                        )
                    }
                }
            }
        }
    }

    // Create / Edit Category Dialog
    if (uiState.isCreateModalOpen || uiState.editingCategory != null) {
        val editing = uiState.editingCategory
        CategoryFormDialog(
            isEditing = editing != null,
            initialName = editing?.name ?: "",
            initialDescription = editing?.description ?: "",
            initialSortOrder = editing?.sortOrder ?: 0,
            initialIsActive = editing?.isActive ?: true,
            initialImageUrl = editing?.imageUrl ?: "",
            isSubmitting = uiState.isSubmitting,
            onSave = { name, desc, sort, active, img ->
                viewModel.saveCategory(name, desc, sort, active, img)
            },
            onDismiss = { viewModel.closeModal() }
        )
    }

    // Delete Confirmation Dialog
    if (uiState.pendingDeleteCategory != null) {
        val cat = uiState.pendingDeleteCategory!!
        AdminConfirmDialog(
            title = "Delete category '${cat.name}'?",
            description = "This will remove '${cat.name}' from active marketplace categories. Products in this category should be reassigned.",
            confirmText = "Delete",
            confirmColor = Error,
            onConfirm = { viewModel.confirmDelete() },
            onDismiss = { viewModel.dismissDelete() }
        )
    }
}

@Composable
private fun CategoryAdminCard(
    category: AdminCategoryItem,
    onToggleStatus: () -> Unit,
    onEdit: () -> Unit,
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
                Row(
                    modifier = Modifier.weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Surface)
                            .border(1.dp, Border, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "🗂️", fontSize = 18.sp)
                    }

                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = category.name,
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, fontSize = 15.sp),
                                color = PrimaryText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (category.isActive) Color(0xFFECFDF5) else Color(0xFFF3F4F6))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = if (category.isActive) "Active" else "Inactive",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (category.isActive) Color(0xFF047857) else Color(0xFF4B5563)
                                )
                            }
                        }

                        if (!category.description.isNullOrBlank()) {
                            Text(
                                text = category.description,
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                color = SecondaryText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }

                Text(
                    text = "Order: ${category.sortOrder}",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, color = SecondaryText)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onToggleStatus,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(34.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp)
                ) {
                    Text(
                        text = if (category.isActive) "Deactivate" else "Activate",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = if (category.isActive) Color(0xFFD97706) else PrimaryGreen
                    )
                }

                OutlinedButton(
                    onClick = onEdit,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(34.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp)
                ) {
                    Text("✏️ Edit", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold), color = PrimaryText)
                }

                OutlinedButton(
                    onClick = onDelete,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Error),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(34.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp)
                ) {
                    Text("🗑️ Delete", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold))
                }
            }
        }
    }
}

@Composable
private fun CategoryFormDialog(
    isEditing: Boolean,
    initialName: String,
    initialDescription: String,
    initialSortOrder: Int,
    initialIsActive: Boolean,
    initialImageUrl: String,
    isSubmitting: Boolean,
    onSave: (name: String, description: String, sortOrder: Int, isActive: Boolean, imageUrl: String?) -> Unit,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf(initialName) }
    var description by remember { mutableStateOf(initialDescription) }
    var sortOrder by remember { mutableStateOf(initialSortOrder.toString()) }
    var isActive by remember { mutableStateOf(initialIsActive) }
    var imageUrl by remember { mutableStateOf(initialImageUrl) }
    var errorText by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (isEditing) "Edit Category" else "Create Category",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; errorText = null },
                    label = { Text("Category Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )

                OutlinedTextField(
                    value = sortOrder,
                    onValueChange = { sortOrder = it.filter { c -> c.isDigit() } },
                    label = { Text("Display Sort Order") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = imageUrl,
                    onValueChange = { imageUrl = it },
                    label = { Text("Image URL (optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Surface)
                        .clickable { isActive = !isActive }
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Category Active Status", style = MaterialTheme.typography.bodyMedium)
                    Switch(
                        checked = isActive,
                        onCheckedChange = { isActive = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = PrimaryGreen)
                    )
                }

                if (errorText != null) {
                    Text(text = errorText!!, color = Error, style = MaterialTheme.typography.bodySmall)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.trim().isBlank()) {
                        errorText = "Category name is required"
                        return@Button
                    }
                    val sort = sortOrder.toIntOrNull() ?: 0
                    onSave(name.trim(), description.trim(), sort, isActive, imageUrl.trim().ifBlank { null })
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text(if (isSubmitting) "Saving..." else if (isEditing) "Save Changes" else "Create", fontWeight = FontWeight.Bold)
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
