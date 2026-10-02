# PDQ POS Terminal Demo

This is a lightweight website for a POS checkout screen that accepts only Visa and Mastercard payments in USD or EUR.

## Features
- Product catalog and cart
- Currency selector: USD / EUR
- PDQ-style payment terminal panel
- Card validation for Visa and Mastercard only
- Simulated transaction approval flow
- Receipt generation

## Run locally
Open `index.html` directly in a browser, or serve the folder with a basic web server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Notes
- This is a front-end demo only.
- It does not connect to a real payment gateway or a live PDQ machine.
- It is designed to simulate a secure card processing workflow for demonstration purposes.

## Files
- `index.html`
- `styles.css`
- `script.js`
