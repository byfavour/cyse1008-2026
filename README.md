TODO:

- checkout process integrated with stripe
- improve efficiency - seems slow - make it faster
- cart is holding onto items; maybe because the order isn't flipping to paid
- simplify addresses in checkout
- streamline payment options in checkout
  checkout
  zomato
  blinkit zip 560029
  smmlite payments email address confirmation
  UBI
  razorpay indian payments

with new versions of stripeCLI
Download the latest linux tar.gz file from GitHub.

    Unzip the file: tar -xvf stripe_X.X.X_linux_x86_64.tar.gz.

    Move ./stripe to your execution path.  -> to do this go into the unzipped folder and move the stripe executable
    sudo mv stripe /usr/local/bin/

The value stored there starts with whsec_P1…, which is the dashboard webhook destination secret you screenshotted. That’s why your console.log prints shsec_P1… and why the signature never matches the CLI listener’s whsec_bb97….

To fix it, update the Secret Manager entry to the CLI’s secret:

    firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# respond with the CLI-generated whsec_bb97…

firebase functions:secrets:set STRIPE_SECRET_KEY

# paste the current sk*test*… if needed
