import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes.js"

describe("Given I am connected as an employee", () => {

  // Connect with user type 'Employee' to have VerticalLayout with WindowIcon (bill icon)
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: 'mel@gmail.com'
  }))

  // Mock navigation
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  describe("When I am on NewBill Page", () => {
    test("Then New Bill page should be rendered", () => {

      // Create NewBill page
      const html = NewBillUI()
      document.body.innerHTML = html

      // Check NewBill page rendered
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      
    })
  })

  describe("When I am on New Bill Page and I click on Send button with all required fields", () => {
    test("Then Bills page should be rendered", () => {

      // Create NewBill page
      const html = NewBillUI()
      document.body.innerHTML = html

      // Check NewBill page rendered
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('btn-send-bill')).toBeTruthy()
      
      // Create NewBill manager
      const container = new NewBill({document, onNavigate, firestore:null, localStorageMock})
      
      // Add test value to input fields
      screen.getByTestId('expense-type').value='Transports'
      screen.getByTestId('expense-name').value='Vol Paris Londres'
      screen.getByTestId('amount').value=100
      screen.getByTestId('datepicker').value='10/10/2021'
      screen.getByTestId('vat').value=20
      screen.getByTestId('pct').value=10
      screen.getByTestId('commentary').value='Dummy comment'
      
      // Execute handle submit form
      const form = screen.getByTestId('form-new-bill')
      const event = { target: form, preventDefault: jest.fn() }
      container.handleSubmit(event)
      
      // Check new bill created and back to bills page
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy()

    })
  })

  describe("When I am on New Bill Page and I uploaded a 'correct' file (jpeg or jpg or png)", () => {
    test("Then file should be accepted", () => {

      // Create NewBill page
      const html = NewBillUI()
      document.body.innerHTML = html

      // Check NewBill page rendered
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
      
      // Mock window.alert
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      // Create NewBill manager
      const container = new NewBill({document, onNavigate, firestore:null, localStorageMock})
      
      // Execute handle change file with 'test.png'
      const event = { target: { value: 'test.png' } }
      container.handleChangeFile(event)
      
      // Check that no error message has been called
      expect(window.alert).not.toBeCalled()

    })
  })

  describe("When I am on New Bill Page and I uploaded an 'incorrect' file (not jpeg nor jpg nor png)", () => {
    test("Then the file should be rejected and an error message should be rendered", () => {
      
      // Create NewBill page
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
      
      // Mock window.alert
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Create NewBill manager
      const container = new NewBill({document, onNavigate, firestore:null, localStorageMock})
      
      // Execute handle change file with 'test.pdf'
      const event = { target: { value: 'test.pdf' } }
      container.handleChangeFile(event)
      
      // Check that error message has been called with expected message
      expect(window.alert).toBeCalledWith("Format non supporté: test.pdf. seul les formats jpeg, jpg et png sont supportés.");

    })
  })
})