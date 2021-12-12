import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', (e) => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = e => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'><img data-testid="modal-img" width="100%" src=${billUrl} /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
   
    // Properly get user email
    let user;
    user = JSON.parse(localStorage.getItem('user'))
    if (typeof user === 'string') {
      user = JSON.parse(user)
    }
    const userEmail = user ? user.email : ""

    if (this.firestore) {
      return this.firestore
      .bills()
      .get()
      .then(snapshot => {
        const bills = snapshot.docs
          .map(doc => {
            try {
              return {
                ...doc.data(),
                date: formatDate(doc.data().date),
                status: formatStatus(doc.data().status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc.data())
              return {
                ...doc.data(),
                date: doc.data().date,
                status: formatStatus(doc.data().status)
              }
            }
          })
          .filter(bill => bill.email === userEmail)
          console.log('length', bills.length)
        return bills
      })
      .catch(error => error)
    }
  }
}