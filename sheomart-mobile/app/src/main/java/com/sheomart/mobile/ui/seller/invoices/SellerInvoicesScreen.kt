package com.sheomart.mobile.ui.seller.invoices

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.sheomart.mobile.data.model.InvoiceRecord
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.StatusBadge
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerInvoicesScreen(
    viewModel: SellerInvoicesViewModel,
    onBack: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val state by viewModel.invoicesState.collectAsState()
    val filterTab by viewModel.filterTab.collectAsState()
    val actionMsg by viewModel.actionMessage.collectAsState()

    var paymentTargetInvoice by remember { mutableStateOf<InvoiceRecord?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(actionMsg) {
        actionMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearActionMessage()
        }
    }

    // Modal to Confirm Pending Payment
    if (paymentTargetInvoice != null) {
        val inv = paymentTargetInvoice!!
        var method by remember { mutableStateOf("CASH") }
        var notes by remember { mutableStateOf("") }

        Dialog(onDismissRequest = { paymentTargetInvoice = null }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = colorScheme.surface,
                modifier = Modifier.fillMaxWidth().padding(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Confirm Pending Payment",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = colorScheme.onSurface
                    )
                    Text(
                        text = "Invoice #${inv.invoiceNumber} • Customer: ${inv.customerName}",
                        style = MaterialTheme.typography.bodySmall,
                        color = colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Pending Amount: ₹${inv.grandTotal.toInt()}",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                        color = colorScheme.primary
                    )

                    Text("Received Payment via:", style = MaterialTheme.typography.labelSmall, color = colorScheme.onSurfaceVariant)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("CASH", "UPI", "CREDIT").forEach { m ->
                            val isSelected = method == m
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) colorScheme.primary else colorScheme.surfaceContainerHighest)
                                    .clickable { method = m }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = m,
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    ),
                                    color = if (isSelected) colorScheme.onPrimary else colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Reference Note (Optional)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = { paymentTargetInvoice = null }) {
                            Text("Cancel", color = colorScheme.onSurfaceVariant)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        PrimaryButton(
                            text = "Mark Paid",
                            onClick = {
                                val target = paymentTargetInvoice
                                paymentTargetInvoice = null
                                if (target != null) {
                                    viewModel.confirmPendingPayment(
                                        invoiceId = target.invoiceId,
                                        method = method,
                                        amount = target.grandTotal,
                                        notes = notes.takeIf { it.isNotBlank() }
                                    )
                                }
                            },
                            modifier = Modifier.width(130.dp)
                        )
                    }
                }
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Invoice History",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = colorScheme.onSurface
                        )
                        Text(
                            text = "Counter Invoices & Payment Ledger",
                            style = MaterialTheme.typography.bodySmall,
                            color = colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 22.sp, color = colorScheme.primary, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colorScheme.surface)
            )
        },
        containerColor = colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            TabRow(
                selectedTabIndex = filterTab,
                containerColor = colorScheme.surface,
                contentColor = colorScheme.primary
            ) {
                listOf("All Invoices", "Paid", "Pending Payment").forEachIndexed { index, label ->
                    Tab(
                        selected = filterTab == index,
                        onClick = { viewModel.selectFilter(index) },
                        text = {
                            Text(
                                text = label,
                                fontWeight = if (filterTab == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (filterTab == index) colorScheme.primary else colorScheme.onSurfaceVariant
                            )
                        }
                    )
                }
            }

            Box(modifier = Modifier.fillMaxSize()) {
                when (val res = state) {
                    is UiState.Loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = colorScheme.primary)
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            SectionErrorView(message = res.message, onRetry = { viewModel.loadInvoices() })
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            SectionEmptyView(title = "No invoices found", description = "Invoices generated from POS billing will appear here.")
                        }
                    }
                    is UiState.Success -> {
                        val filtered = res.data.filter { inv ->
                            val isPaid = inv.paymentStatus.uppercase() in listOf("PAID", "SETTLED")
                            when (filterTab) {
                                1 -> isPaid
                                2 -> !isPaid
                                else -> true
                            }
                        }

                        if (filtered.isEmpty()) {
                            Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                                SectionEmptyView(
                                    title = if (filterTab == 2) "No pending payments" else "No invoices found",
                                    description = if (filterTab == 2) "All invoices are fully paid and settled." else "Past invoices will appear here."
                                )
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                items(filtered, key = { it.invoiceId }) { invoice ->
                                    val isPending = invoice.paymentStatus.uppercase() !in listOf("PAID", "SETTLED")
                                    InvoiceCard(
                                        invoice = invoice,
                                        isPending = isPending,
                                        onConfirmPayment = { paymentTargetInvoice = invoice }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun InvoiceCard(
    invoice: InvoiceRecord,
    isPending: Boolean,
    onConfirmPayment: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(colorScheme.surface)
            .border(
                1.dp,
                if (isPending) colorScheme.error.copy(alpha = 0.5f) else colorScheme.outlineVariant,
                RoundedCornerShape(16.dp)
            )
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = invoice.invoiceNumber,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = colorScheme.onSurface
                )
                Text(
                    text = "Customer: ${invoice.customerName}",
                    style = MaterialTheme.typography.bodySmall,
                    color = colorScheme.onSurfaceVariant
                )
            }

            StatusBadge(text = invoice.paymentStatus)
        }

        HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Payment: ${invoice.paymentMethod}",
                    style = MaterialTheme.typography.bodySmall,
                    color = colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${invoice.totalItems} items billed",
                    style = MaterialTheme.typography.labelSmall,
                    color = colorScheme.onSurfaceVariant
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "₹${invoice.grandTotal.toInt()}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                    color = if (isPending) colorScheme.error else colorScheme.primary
                )
                if (isPending) {
                    Text(
                        text = "Pending",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = colorScheme.error
                    )
                }
            }
        }

        if (isPending) {
            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Payment pending at checkout",
                    style = MaterialTheme.typography.bodySmall,
                    color = colorScheme.error
                )
                Button(
                    onClick = onConfirmPayment,
                    colors = ButtonDefaults.buttonColors(containerColor = colorScheme.primary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    modifier = Modifier.height(32.dp)
                ) {
                    Text("Confirm Payment", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                }
            }
        }
    }
}
