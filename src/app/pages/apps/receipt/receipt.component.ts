import { Component, OnInit } from '@angular/core'
// const orders: any = require('./data.json')
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap'
import { AuthService } from 'src/app/auth.service'
import {
  NgbDate,
  NgbDateStruct,
  NgbCalendar,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap'
import * as moment from 'moment'

import {
  NzPlacementType,
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown'
@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
})
export class ReceiptComponent implements OnInit {
  model: NgbDateStruct
  date: { year: number; month: number }
  public buttonName: any = 'Back'
  value: string
  dateRange = []
  selectedValue = 'All'
  receipts: any
  show: number = 0
  orderitem: any
  orderno: any
  Subtotal: number = 0
  CGST: number = 0
  SGST: number = 0
  IGST: number = 0
  Total: number = 0
  additionalCharge: number = 0
  element: any
  KOTs: any
  KOTItems: any = {}
  CompanyId: any
  StoreId: any
  UserId: number
  OrderStauts: number
  AdditionalCharges: any = []
  FirstId: boolean
  LastId: boolean
  systemPrinters: any
  address: any
  city: any
  phone: any
  orderedDate: any
  Company: any
  ContactNo: any
  strdate: string
  enddate: string
  user: any
  id = 1
  loginfo
  showcalendar = false
  roleid
  hoveredDate: NgbDate | null = null

  fromDate: NgbDate
  toDate: NgbDate | null = null
  constructor(
    private Auth: AuthService,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
  ) {
    this.UserId = null
    this.transaction = {
      Amount: 0,
      OrderId: 0,
      CompanyId: this.CompanyId,
      StoreId: this.StoreId,
      PaymentTypeId: 0,
      CustomerId: 0,
      UserId: this.UserId,
    }

    this.fromDate = calendar.getToday()
    this.toDate = calendar.getToday()
  }

  //OLD POS MAster
  ordData: any
  pending: any
  PaidAmount: any
  transaction: {
    Amount: number
    OrderId: number
    CompanyId: number
    StoreId: number
    PaymentTypeId: number
    CustomerId: number
    UserId: number
  }
  transactions: any
  customer: any
  cash: number
  card: number
  paymentid: number
  price: number
  remaining: number
  online$: boolean = navigator.onLine
  Discount: number
  invoice
  OrderSts = {}
  PaymentSts = {}
  exclude1 = {}
  exclude2 = {}
  ordSts = 'All'
  pmtSts = 'All'
  ngforLen
  totalsales: number = 0
  totalpayments: number = 0
  paymentpercent
  ordertype = ''
  orderlogs: any = []
  show_carousel = false
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment()
        .subtract(1, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month'),
    ],
  }
  invalidDates: moment.Moment[] = [
    moment().add(2, 'days'),
    moment().add(3, 'days'),
    moment().add(5, 'days'),
  ]
  selected: any = { startDate: moment(), endDate: moment() }
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }
  today: string = moment().format('YYYY-MM-DD')
  preferences = { ShowTaxonBill: true }

  paymenttypes = []
  ngOnInit(): void {
    this.Auth.getdbdata(['preferences', 'paymenttypes']).subscribe(data => {
      this.preferences = data['preferences']
      this.paymenttypes = data['paymenttypes']
      this.getReceipt(moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'))
    })
    // this.datService.execute();
    this.preferences = JSON.parse(localStorage.getItem('preferences'))
    // setHeightWidth();
    this.strdate = moment().format('YYYY-MM-DD')
    this.enddate = moment().format('YYYY-MM-DD')
    console.log(this.strdate, this.enddate)
  }

  toggle() {
    if (this.show) this.buttonName = 'Back'
    else this.buttonName = 'Back'
  }

  nextRecipts(type) {
    if (type == 'next') {
      this.getReceipt(
        this.receipts.receipts[this.receipts.receipts.length - 1].this.strdate,
        this.enddate,
      )
    } else if (type == 'prev') {
      this.getReceipt(this.receipts.receipts[0].this.strdate, this.enddate)
    }
  }

  // retry(order) {
  //   this.Auth.saveorder({ ordData: JSON.stringify([order]) }).subscribe(data => {
  //     console.log(data)
  //   })
  // }
  filterorderlogs() {
    return this.orderlogs.filter(x => !x.hide)
  }

  getReceipt(fromdate, todate) {
    this.Auth.gettestreceipt((this.StoreId = 26), fromdate, todate).subscribe(data => {
      this.receipts = data
      console.log(this.receipts)
    })
  }
  setdate(e) {
    if (e.startDate != (null || undefined) && e.endDate != (null || undefined)) {
      this.strdate = moment(e.startDate).format('YYYY-MM-DD')
      this.enddate = moment(e.endDate).format('YYYY-MM-DD')
      console.log(this.strdate, this.enddate)
      this.getReceipt(this.strdate, this.enddate)
    }
  }
  payment(Id) {
    this.transaction.PaymentTypeId = Id
    this.receipts.PaymentType.forEach(element => {
      if (element.Id == Id) {
        element.Price = this.Total - this.PaidAmount
        this.transaction.Amount = element.Price
        this.remaining = this.transaction.Amount - element.Price
      } else {
        element.Price = 0
      }
    })
  }
  setPrice() {
    this.transaction.Amount = 0
    let count = 0
    let Id
    this.receipts.PaymentType.forEach(element => {
      if (element.Price > 0) {
        count++
        Id = element.Id
      }
      this.transaction.Amount = this.transaction.Amount + element.Price
    })
    if (count == 1) {
      this.transaction.PaymentTypeId = Id
    }
  }
  sum() {
    this.price = 0
    this.receipts.PaymentType.forEach(element => {
      this.price = this.price + element.Price
    })
    this.remaining = this.Total - this.PaidAmount - this.price
  }

  selectToday() {
    this.model = this.calendar.getToday()
  }
  onDateSelection(date: NgbDate, datepicker) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date
      this.strdate = this.formatter.format(this.fromDate)
    } else if (
      this.fromDate &&
      !this.toDate &&
      (date.after(this.fromDate) || date.equals(this.fromDate))
    ) {
      this.toDate = date
      this.enddate = this.formatter.format(this.toDate)
    } else {
      this.toDate = null
      this.fromDate = date
      this.strdate = this.formatter.format(this.fromDate)
    }
    if (this.fromDate && this.toDate) {
      this.strdate = this.formatter.format(this.fromDate)
      this.enddate = this.formatter.format(this.toDate)
      datepicker.toggle()
      this.getReceipt(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    )
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate)
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    )
  }
}
