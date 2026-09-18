package com.sheomart.mobile.ui.admin.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AdminCategoryItem
import com.sheomart.mobile.data.repository.AdminRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AdminCategoriesUiState(
    val categoriesState: UiState<List<AdminCategoryItem>> = UiState.Loading,
    val searchQuery: String = "",
    val editingCategory: AdminCategoryItem? = null,
    val isCreateModalOpen: Boolean = false,
    val pendingDeleteCategory: AdminCategoryItem? = null,
    val isSubmitting: Boolean = false,
    val feedbackMessage: String? = null
)

class AdminCategoriesViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminCategoriesUiState())
    val uiState: StateFlow<AdminCategoriesUiState> = _uiState.asStateFlow()

    private var allCategoriesCache: List<AdminCategoryItem> = emptyList()

    init {
        loadCategories()
    }

    fun loadCategories() {
        viewModelScope.launch {
            _uiState.update { it.copy(categoriesState = UiState.Loading) }
            val result = repository.getCategories()
            result.fold(
                onSuccess = { categories ->
                    allCategoriesCache = categories
                    applyFilters()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(categoriesState = UiState.Error(error.message ?: "Unable to load categories"))
                    }
                }
            )
        }
    }

    fun onSearchChange(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        applyFilters()
    }

    private fun applyFilters() {
        val query = _uiState.value.searchQuery.trim().lowercase()
        val filtered = allCategoriesCache.filter { cat ->
            query.isBlank() ||
                cat.name.lowercase().contains(query) ||
                (cat.description?.lowercase()?.contains(query) == true)
        }

        _uiState.update {
            it.copy(
                categoriesState = if (filtered.isEmpty()) UiState.Empty else UiState.Success(filtered)
            )
        }
    }

    fun openCreateModal() {
        _uiState.update { it.copy(isCreateModalOpen = true, editingCategory = null) }
    }

    fun openEditModal(category: AdminCategoryItem) {
        _uiState.update { it.copy(editingCategory = category, isCreateModalOpen = false) }
    }

    fun closeModal() {
        _uiState.update { it.copy(isCreateModalOpen = false, editingCategory = null) }
    }

    fun saveCategory(name: String, description: String, sortOrder: Int, isActive: Boolean, imageUrl: String?) {
        val editing = _uiState.value.editingCategory
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            if (editing != null) {
                val result = repository.updateCategory(editing.categoryId, name, description, sortOrder, isActive, imageUrl)
                result.fold(
                    onSuccess = {
                        _uiState.update { it.copy(isSubmitting = false, editingCategory = null, feedbackMessage = "Category '$name' updated.") }
                        loadCategories()
                    },
                    onFailure = { error ->
                        _uiState.update { it.copy(isSubmitting = false, feedbackMessage = error.message ?: "Update failed") }
                    }
                )
            } else {
                val result = repository.createCategory(name, description, sortOrder, isActive, imageUrl)
                result.fold(
                    onSuccess = {
                        _uiState.update { it.copy(isSubmitting = false, isCreateModalOpen = false, feedbackMessage = "Category '$name' created.") }
                        loadCategories()
                    },
                    onFailure = { error ->
                        _uiState.update { it.copy(isSubmitting = false, feedbackMessage = error.message ?: "Create failed") }
                    }
                )
            }
        }
    }

    fun toggleCategoryStatus(category: AdminCategoryItem) {
        viewModelScope.launch {
            val newStatus = !category.isActive
            val result = repository.updateCategoryStatus(category.categoryId, newStatus)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(feedbackMessage = "Category '${category.name}' ${if (newStatus) "activated" else "deactivated"}.")
                    }
                    loadCategories()
                },
                onFailure = { error ->
                    _uiState.update { it.copy(feedbackMessage = error.message ?: "Status toggle failed") }
                }
            )
        }
    }

    fun requestDelete(category: AdminCategoryItem) {
        _uiState.update { it.copy(pendingDeleteCategory = category) }
    }

    fun dismissDelete() {
        _uiState.update { it.copy(pendingDeleteCategory = null) }
    }

    fun confirmDelete() {
        val category = _uiState.value.pendingDeleteCategory ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            val result = repository.deleteCategory(category.categoryId)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            pendingDeleteCategory = null,
                            feedbackMessage = "Category '${category.name}' deleted."
                        )
                    }
                    loadCategories()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            feedbackMessage = error.message ?: "Delete failed"
                        )
                    }
                }
            )
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
