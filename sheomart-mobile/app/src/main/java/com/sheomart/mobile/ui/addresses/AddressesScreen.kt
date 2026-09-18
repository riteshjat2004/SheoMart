package com.sheomart.mobile.ui.addresses

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
import com.sheomart.mobile.data.model.AddressItem
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressesScreen(
    viewModel: AddressesViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.addressesState.collectAsState()
    val actionMsg by viewModel.actionMessage.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(actionMsg) {
        actionMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Saved Addresses", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, color = PrimaryGreen)
                    }
                },
                actions = {
                    TextButton(onClick = { showAddDialog = true }) {
                        Text("+ Add New", color = PrimaryGreen, style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
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
        ) {
            when (val res = state) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryGreen)
                    }
                }
                is UiState.Error -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        SectionErrorView(
                            message = res.message,
                            onRetry = { viewModel.loadAddresses() }
                        )
                    }
                }
                is UiState.Empty -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Text("📍", fontSize = 48.sp)
                            SectionEmptyView(
                                title = "No saved addresses yet",
                                description = "Add your home, office or shop address for fast checkout."
                            )
                            PrimaryButton(
                                text = "+ Add Address",
                                onClick = { showAddDialog = true },
                                modifier = Modifier.width(180.dp)
                            )
                        }
                    }
                }
                is UiState.Success -> {
                    val addresses = res.data
                    if (addresses.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Text("📍", fontSize = 48.sp)
                                SectionEmptyView(
                                    title = "No saved addresses yet",
                                    description = "Add your home, office or shop address for fast checkout."
                                )
                                PrimaryButton(
                                    text = "+ Add Address",
                                    onClick = { showAddDialog = true },
                                    modifier = Modifier.width(180.dp)
                                )
                            }
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(addresses) { address ->
                                AddressCard(
                                    address = address,
                                    onDelete = { viewModel.deleteAddress(address.addressId) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddAddressDialog(
            onDismiss = { showAddDialog = false },
            onSave = { title, line, landmark, city, state, pincode, name, mobile, isDefault ->
                viewModel.addAddress(title, line, landmark, city, state, pincode, name, mobile, isDefault)
                showAddDialog = false
            }
        )
    }
}

@Composable
private fun AddressCard(
    address: AddressItem,
    onDelete: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = address.title,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                if (address.isDefault) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFFD1FAE5))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "DEFAULT",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            color = PrimaryGreen
                        )
                    }
                }
            }

            IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                Text("🗑️", fontSize = 14.sp)
            }
        }

        Text(
            text = address.addressLine,
            style = MaterialTheme.typography.bodyMedium,
            color = PrimaryText
        )

        if (!address.landmark.isNullOrBlank()) {
            Text(
                text = "Landmark: ${address.landmark}",
                style = MaterialTheme.typography.bodySmall,
                color = SecondaryText
            )
        }

        Text(
            text = "${address.city}, ${address.state} - ${address.pincode}",
            style = MaterialTheme.typography.bodySmall,
            color = SecondaryText
        )

        if (!address.receiverName.isNullOrBlank() || !address.receiverMobile.isNullOrBlank()) {
            Divider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                if (!address.receiverName.isNullOrBlank()) {
                    Text(text = "Receiver: ${address.receiverName}", style = MaterialTheme.typography.bodySmall, color = PrimaryText)
                }
                if (!address.receiverMobile.isNullOrBlank()) {
                    Text(text = "Phone: ${address.receiverMobile}", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                }
            }
        }
    }
}

@Composable
private fun AddAddressDialog(
    onDismiss: () -> Unit,
    onSave: (
        title: String,
        line: String,
        landmark: String?,
        city: String,
        state: String,
        pincode: String,
        name: String?,
        mobile: String?,
        isDefault: Boolean
    ) -> Unit
) {
    var title by remember { mutableStateOf("Home") }
    var addressLine by remember { mutableStateOf("") }
    var landmark by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Sheopur") }
    var stateName by remember { mutableStateOf("Madhya Pradesh") }
    var pincode by remember { mutableStateOf("476337") }
    var receiverName by remember { mutableStateOf("") }
    var receiverMobile by remember { mutableStateOf("") }
    var isDefault by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Add New Address",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )

                // Title selector chips (Home / Work / Other)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Home", "Work", "Shop").forEach { t ->
                        val sel = title == t
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (sel) PrimaryGreen else Surface)
                                .clickable { title = t }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(t, color = if (sel) Color.White else PrimaryText, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }

                OutlinedTextField(
                    value = addressLine,
                    onValueChange = { addressLine = it },
                    label = { Text("Street Address / House No.") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                OutlinedTextField(
                    value = landmark,
                    onValueChange = { landmark = it },
                    label = { Text("Landmark (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = city,
                        onValueChange = { city = it },
                        label = { Text("City") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = pincode,
                        onValueChange = { pincode = it },
                        label = { Text("Pincode") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = receiverName,
                    onValueChange = { receiverName = it },
                    label = { Text("Receiver Name (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                OutlinedTextField(
                    value = receiverMobile,
                    onValueChange = { receiverMobile = it },
                    label = { Text("Receiver Mobile (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = isDefault,
                        onCheckedChange = { isDefault = it },
                        colors = CheckboxDefaults.colors(checkedColor = PrimaryGreen)
                    )
                    Text("Set as default delivery address", style = MaterialTheme.typography.bodySmall)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) { Text("Cancel", color = SecondaryText) }
                    Spacer(modifier = Modifier.width(8.dp))
                    PrimaryButton(
                        text = "Save Address",
                        onClick = {
                            if (addressLine.isNotBlank()) {
                                onSave(
                                    title,
                                    addressLine,
                                    landmark.takeIf { it.isNotBlank() },
                                    city,
                                    stateName,
                                    pincode,
                                    receiverName.takeIf { it.isNotBlank() },
                                    receiverMobile.takeIf { it.isNotBlank() },
                                    isDefault
                                )
                            }
                        },
                        modifier = Modifier.width(140.dp),
                        enabled = addressLine.isNotBlank()
                    )
                }
            }
        }
    }
}
