import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Track processed transaction IDs for idempotency
const processedTransactionIds = new Set()

// Async thunk for idempotent transactions
export const processTransaction = createAsyncThunk(
  'transactions/process',
  async ({ transactionId, data }, { getState, rejectWithValue }) => {
    // Check if transaction was already processed (idempotency check)
    if (processedTransactionIds.has(transactionId)) {
      // Return existing transaction result instead of processing again
      const state = getState()
      const existingTransaction = state.transactions.items.find(
        (item) => item.id === transactionId
      )
      if (existingTransaction) {
        return existingTransaction
      }
    }

    // Simulate API call or transaction processing
    // In a real app, this would be your API endpoint
    // For demo purposes, we simulate a network delay
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // In production, you would make an actual API call:
      // const response = await fetch('/api/transactions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Idempotency-Key': transactionId, // Standard header for idempotency
      //   },
      //   body: JSON.stringify(data),
      // })
      // const result = await response.json()
      
      // For demo: simulate successful transaction
      const result = {
        status: 'completed',
        amount: data.amount,
        type: data.type,
        message: 'Transaction processed successfully',
      }
      
      // Mark transaction as processed
      processedTransactionIds.add(transactionId)
      
      return {
        id: transactionId,
        ...result,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      // If transaction already exists on server, return existing result
      if (error.message.includes('already processed')) {
        processedTransactionIds.add(transactionId)
        return {
          id: transactionId,
          status: 'completed',
          message: 'Transaction already processed',
        }
      }
      return rejectWithValue(error.message)
    }
  }
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTransactions: (state) => {
      state.items = []
      processedTransactionIds.clear()
    },
    removeTransaction: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      processedTransactionIds.delete(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processTransaction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processTransaction.fulfilled, (state, action) => {
        state.loading = false
        // Only add if not already present (idempotency)
        const existingIndex = state.items.findIndex(
          (item) => item.id === action.payload.id
        )
        if (existingIndex === -1) {
          state.items.push(action.payload)
        } else {
          // Update existing transaction
          state.items[existingIndex] = action.payload
        }
      })
      .addCase(processTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Transaction failed'
      })
  },
})

export const { clearTransactions, removeTransaction } = transactionsSlice.actions
export default transactionsSlice.reducer
