// packages/lib/src/utils/stellar.ts
import { Asset, BASE_FEE, Contract, Keypair, Networks, Operation, Server, TransactionBuilder } from 'stellar-sdk'

/**
 * Utility functions for Stellar blockchain interactions
 */

/**
 * Convert XLM amount to stroops (1 XLM = 10^7 stroops)
 */
export function xlmToStroops(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return Math.floor(numAmount * 10000000).toString()
}

/**
 * Convert stroops to XLM amount
 */
export function stroopsToXlm(stroops: string | number): string {
  const numStroops = typeof stroops === 'string' ? parseInt(stroops) : stroops
  return (numStroops / 10000000).toString()
}

/**
 * Format XLM amount for display
 */
export function formatXlmAmount(amount: string | number, decimals = 7): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return numAmount.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * Create a Stellar server instance for the specified network
 */
export function createStellarServer(network: 'testnet' | 'mainnet' = 'testnet'): Server {
  const horizonUrl = network === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org'

  return new Server(horizonUrl)
}

/**
 * Get network passphrase for the specified network
 */
export function getNetworkPassphrase(network: 'testnet' | 'mainnet' = 'testnet'): string {
  return network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET
}

/**
 * Validate a Stellar address
 */
export function isValidStellarAddress(address: string): boolean {
  try {
    Keypair.fromPublicKey(address)
    return true
  } catch {
    return false
  }
}

/**
 * Validate a Stellar secret key
 */
export function isValidStellarSecret(secret: string): boolean {
  try {
    Keypair.fromSecret(secret)
    return true
  } catch {
    return false
  }
}

/**
 * Generate a new Stellar keypair
 */
export function generateStellarKeypair(): { publicKey: string; secretKey: string } {
  const keypair = Keypair.random()

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  }
}

/**
 * Create a trustline operation for a Stellar asset
 */
export function createTrustlineOperation(
  asset: Asset,
  limit?: string
): Operation.ChangeTrust {
  return Operation.changeTrust({
    asset,
    limit: limit || '900000000000.0000000', // Max limit
  })
}

/**
 * Create a payment operation
 */
export function createPaymentOperation(
  destination: string,
  asset: Asset,
  amount: string
): Operation.Payment {
  return Operation.payment({
    destination,
    asset,
    amount,
  })
}

/**
 * Build a transaction with the given operations
 */
export async function buildTransaction(
  sourceKeypair: Keypair,
  operations: Operation[],
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string> {
  const server = createStellarServer(network)
  const networkPassphrase = getNetworkPassphrase(network)

  // Get account
  const account = await server.loadAccount(sourceKeypair.publicKey())

  // Build transaction
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperations(operations)
    .setTimeout(30)
    .build()

  // Sign transaction
  transaction.sign(sourceKeypair)

  // Return XDR
  return transaction.toEnvelope().toXDR('base64')
}

/**
 * Submit a transaction to the Stellar network
 */
export async function submitTransaction(
  transactionXdr: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<any> {
  const server = createStellarServer(network)

  try {
    const transaction = TransactionBuilder.fromXDR(transactionXdr, getNetworkPassphrase(network))
    const result = await server.submitTransaction(transaction)

    return {
      success: true,
      hash: result.hash,
      ledger: result.ledger,
      result: result,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
    }
  }
}

/**
 * Get account balances
 */
export async function getAccountBalances(
  publicKey: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<Array<{ asset: string; balance: string; limit?: string }>> {
  const server = createStellarServer(network)

  try {
    const account = await server.loadAccount(publicKey)

    return account.balances.map((balance: any) => ({
      asset: balance.asset_type === 'native' ? 'XLM' : `${balance.asset_code}:${balance.asset_issuer}`,
      balance: balance.balance,
      limit: balance.limit,
    }))
  } catch (error) {
    throw new Error(`Failed to load account balances: ${error}`)
  }
}

/**
 * Check if an account exists on the network
 */
export async function accountExists(
  publicKey: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<boolean> {
  const server = createStellarServer(network)

  try {
    await server.loadAccount(publicKey)
    return true
  } catch {
    return false
  }
}

/**
 * Get contract instance from contract ID
 */
export function getContractInstance(contractId: string): Contract {
  return new Contract(contractId)
}

/**
 * Format transaction hash for display
 */
export function formatTransactionHash(hash: string): string {
  if (hash.length <= 16) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

/**
 * Validate contract ID format
 */
export function isValidContractId(contractId: string): boolean {
  try {
    // Contract IDs should be 32 bytes (64 characters when hex-encoded)
    return /^[a-fA-F0-9]{64}$/.test(contractId)
  } catch {
    return false
  }
}