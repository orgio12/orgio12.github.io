NOMIAPC — THE BIRTHDAY INVITATIONAL
===================================

WHAT'S INCLUDED
  index.html      Website entry page (open this in a browser)
  style.css       Colors, graphics, animations, mobile styling
  content.js      EDIT THE MONGOLIAN INVITATION AND PERSONAL MESSAGES HERE
  judge.js        Tiny C++-expression evaluator and three challenge definitions
  script.js       Site navigation, submissions, gift reveal, envelope animation
  assets/         One square photo of Nomia for the prize screen
  qr-code.png     QR image for the planned GitHub Pages URL
  qr-print-card.png  Printable birthday QR card (300dpi-ish depending on size)
  make_qr.py      Regenerate QR files if the final URL is different

HOW TO VIEW LOCALLY
  Unzip the folder. Open nomiapc/index.html in Chrome on a computer.
  Test all three problems, click the gift, then open the envelope.

HOW TO EDIT THE LETTER
  Open content.js with VS Code or Notepad.
  Change invitationHeading, invitationParagraphs, invitationPostscript,
  and signature. Make sure to keep the JavaScript quotation marks and commas.
  This is a separate invitation microsite, NOT the main birthday website.

HOW TO PUBLISH TO YOUR EXISTING GITHUB PAGES SITE
  1. Open your orgio12.github.io repository on your computer.
  2. Inside the existing birthday/ folder, create nomiapc/.
  3. Copy all CONTENTS of this ZIP's nomiapc/ folder into birthday/nomiapc/.
  4. From the repository root in PowerShell:
        git add .
        git commit -m "Add NomiaPC invitation"
        git push
  5. Open and TEST this intended URL on a phone:
        https://orgio12.github.io/birthday/nomiapc/
     GitHub Pages may take a bit to publish. Do not print or share until it works.

QR CODE
  The INCLUDED QR currently encodes the INTENDED URL above.
  It is not proof that the invitation has already been deployed.
  PRINT THE CARD ONLY AFTER THE LIVE URL OPENS CORRECTLY ON HER PHONE.
  If you deploy somewhere else, run:
        python make_qr.py https://your-actual-website-address/
  Or ask ChatGPT to generate a fresh QR after you provide the final URL.

ABOUT THE JUDGE
  For a lightweight, zero-backend GitHub Pages microsite, the game checks
  arithmetic expressions using a small safe parser. It does not compile
  arbitrary C++. The code is NOT sent to any server. Three problems, seven
  tests each, including edge cases. Multiple correct formulas are accepted.
  Input is the EXPRESSION appearing after the C++ 'return' keyword.
  Allowed: integer values/variables, + - * / %, comparison, && ||, ?:,
  min(x,y), max(x,y), abs(x), std::max and std::min.
  Correct integer arithmetic uses division truncating toward zero.

HOW TO RESET GAME PROGRESS
  Tap 'START OVER' at the bottom, which resets the page's saved game state.

PRIVACY
  No backend, cookies, analytics, ads, or notification reminders.
  This public GitHub Pages address is accessible to anyone who has the link;
  do not assume the photo or invitation is password-protected.
  The date RSVP buttons DO NOT send a response to Orgio. The girl must tell
  Orgio directly; the page explicitly says so.
