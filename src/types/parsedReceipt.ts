export interface ParsedReceipt {
  id: string,
  goals: string[],
  location: Location
  totalAmount: TotalAmount
  taxAmount: TaxAmount
  discountAmount: DiscountAmount
  paidAmount: PaidAmount
  confidenceLevel: number
  date: Date
  dueDate: DueDate
  text: Text
  amounts: Amount[]
  numbers: Number[]
  entities: Entities
  lineAmounts: any[]
  itemsCount: ItemsCount
  paymentType: PaymentType
  trackingId: string
  merchantName: MerchantName
  merchantAddress: MerchantAddress
  merchantCity: MerchantCity
  merchantState: MerchantState
  merchantCountryCode: MerchantCountryCode
  merchantTypes: MerchantTypes
  merchantPostalCode: MerchantPostalCode
  merchantTaxId: MerchantTaxId
  targetRotation: number
  elapsed: number
}

export interface Location {
  city: City
  continent: Continent
  country: Country
  location: Location2
  registered_country: RegisteredCountry
  subdivisions: Subdivision[]
}

export interface City {
  geoname_id: number
  names: Names
}

export interface Names {
  de: string
  en: string
  es: string
  fr: string
  ja: string
  "pt-BR": string
  ru: string
}

export interface Continent {
  code: string
  geoname_id: number
  names: Names2
}

export interface Names2 {
  de: string
  en: string
  es: string
  fr: string
  ja: string
  "pt-BR": string
  ru: string
  "zh-CN": string
}

export interface Country {
  geoname_id: number
  iso_code: string
  names: Names3
}

export interface Names3 {
  de: string
  en: string
  es: string
  fr: string
  ja: string
  "pt-BR": string
  ru: string
  "zh-CN": string
}

export interface Location2 {
  accuracy_radius: number
  latitude: number
  longitude: number
  time_zone: string
}

export interface RegisteredCountry {
  geoname_id: number
  iso_code: string
  names: Names4
}

export interface Names4 {
  de: string
  en: string
  es: string
  fr: string
  ja: string
  "pt-BR": string
  ru: string
  "zh-CN": string
}

export interface Subdivision {
  geoname_id: number
  iso_code: string
  names: Names5
}

export interface Names5 {
  en: string
  es: string
  fr: string
}

export interface TotalAmount {
  data: number
  confidenceLevel: number
  text: string
  index: number
  keyword: string
  currencyCode: string
  regions: Region[][]
}

export interface Region {
  x: number
  y: number
}

export interface TaxAmount {
  data: number
  confidenceLevel: number
  text: string
  index: number
  keyword: string
  currencyCode: string
  regions: Region2[][]
}

export interface Region2 {
  x: number
  y: number
}

export interface DiscountAmount {
  confidenceLevel: number
}

export interface PaidAmount {
  data: number
  confidenceLevel: number
  text: string
  index: number
  regions: Region3[][]
}

export interface Region3 {
  x: number
  y: number
}

export interface Date {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region4[][]
}

export interface Region4 {
  x: number
  y: number
}

export interface DueDate {
  confidenceLevel: number
}

export interface Text {
  text: string
  regions: Region5[]
}

export interface Region5 {
  x: number
  y: number
}

export interface Amount {
  data: number
  index: number
  regions: Region6[][]
  text: string
}

export interface Region6 {
  x: number
  y: number
}

export interface Number {
  data: number
  text: string
  regions: Region7[][]
  index: number
}

export interface Region7 {
  x: number
  y: number
}

export interface Entities {
  productLineItems: ProductLineItem[]
  IBAN: Iban
  invoiceNumber: InvoiceNumber
  multiTaxLineItems: MultiTaxLineItem[]
  receiptNumber: ReceiptNumber
  last4: Last4
}

export interface ProductLineItem {
  data: Data
  confidenceLevel: number
  text: string
  index: number
  regions: Region8[][]
}

export interface Data {
  name: Name
  quantity: Quantity
  totalPrice: TotalPrice
  unitPrice: UnitPrice
}

export interface Name {
  data: string
  regions: any[]
  text: string
}

export interface Quantity {
  data: number
  regions: any[]
  text: string
}

export interface TotalPrice {
  data: number
  regions: any[]
  text: string
}

export interface UnitPrice {
  data: number
  regions: any[]
  text: string
}

export interface Region8 {
  x: number
  y: number
}

export interface Iban {
  confidenceLevel: number
}

export interface InvoiceNumber {
  data: string
  confidenceLevel: number
  text: string
  keyword: string
}

export interface MultiTaxLineItem {
  data: Data2
  confidenceLevel: number
  index: number
  regions: Region9[][]
}

export interface Data2 {
  netAmount: NetAmount
  taxAmount: TaxAmount2
}

export interface NetAmount {
  text: string
  data: number
}

export interface TaxAmount2 {
  text: string
  data: number
}

export interface Region9 {
  x: number
  y: number
}

export interface ReceiptNumber {
  data: string
  confidenceLevel: number
  text: string
  keyword: string
  index: number
  regions: Region10[][]
}

export interface Region10 {
  x: number
  y: number
}

export interface Last4 {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region11[][]
}

export interface Region11 {
  x: number
  y: number
}

export interface ItemsCount {
  data: number
  confidenceLevel: number
}

export interface PaymentType {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region12[][]
}

export interface Region12 {
  x: number
  y: number
}

export interface MerchantName {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region13[][]
}

export interface Region13 {
  x: number
  y: number
}

export interface MerchantAddress {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region14[][]
}

export interface Region14 {
  x: number
  y: number
}

export interface MerchantCity {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region15[][]
}

export interface Region15 {
  x: number
  y: number
}

export interface MerchantState {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region16[][]
}

export interface Region16 {
  x: number
  y: number
}

export interface MerchantCountryCode {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region17[][]
}

export interface Region17 {
  x: number
  y: number
}

export interface MerchantTypes {
  confidenceLevel: number
}

export interface MerchantPostalCode {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region18[][]
}

export interface Region18 {
  x: number
  y: number
}

export interface MerchantTaxId {
  data: string
  confidenceLevel: number
  text: string
  index: number
  regions: Region19[][]
}

export interface Region19 {
  x: number
  y: number
}
