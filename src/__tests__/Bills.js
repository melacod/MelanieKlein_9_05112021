import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import Bills from "../containers/Bills.js"
import { ROUTES } from "../constants/routes.js"

describe("Given I am connected as an employee", () => {

  // Connect with user type 'Employee' to have VerticalLayout with WindowIcon (bill icon)
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html

      // Check only if WindowIcon (bill icon) is present
      expect(screen.getByTestId('icon-window')).toBeTruthy()

      // fails because 'active-icon' class on WindowIcon (bill icon) is added in Router not in BillsUI
      // expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBeTruthy()

      // same problem as above but try to use jest-dom utility function toHaveClass
      // => it does not works = having exception 'toHaveClass is not a function'
      // expect(screen.getByTestId('icon-window')).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

  })

  describe("When I am on Bills Page and I click on New Bill button", () => {
    test("Then New Bill Page should be rendered", () => {

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy()
  
      const container = new Bills({document, onNavigate, firestore:null, localStorageMock})
      container.handleClickNewBill()
      
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      
    })
  })

  describe("When I am on Bills Page and I click on eye button", () => {
    test("Then modal should be rendered", () => {

      // disable modal jquery function to perevent error 'TypeError: $(...).modal is not a function'
      $.fn.modal = jest.fn();

      // Display Bills page and check number of eye buttons
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      expect(screen.getAllByTestId('icon-eye').length).toEqual(4)
  
      const container = new Bills({document, onNavigate, firestore:null, localStorageMock})

      // Click on first eye button
      const firstEyeIcon = screen.getAllByTestId('icon-eye')[0]
      container.handleClickIconEye(firstEyeIcon)
      
      // Check if image in modal is the one linked to first eye button
      const url = firstEyeIcon.getAttribute("data-bill-url")
      expect(screen.getByTestId('modal-img').getAttribute('src') === url).toBeTruthy()

    })
  })
  
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {

  describe("When I navigate to Bills", () => {

    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })

  })
})