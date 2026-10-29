NOMIA'S LITTLE BIRTHDAY UNIVERSE ♡
=================================

START
-----
1. Unzip the folder, keeping index.html, styles.css, site.js, puzzle.js, content.js,
   qr.html, qr.js, assets/, and vendor/ together.
2. Open index.html in your browser, OR preview with a local web server:
      python -m http.server 8000
   Then visit http://localhost:8000/
3. Change the Mongolian messages in content.js using any text editor. Save and refresh.
4. To update photos, replace these images with your own SQUARE (1:1) versions:
   assets/hero.jpg    — second outdoor peace-sign photo
   assets/medal.jpg   — holding the medal
   assets/study.jpg   — sitting at the desk
   assets/cake.jpg    — dark photo holding candle and cake
   Photos are currently included, square-cropped from the exact images provided.
5. Change CSS in styles.css, if desired. The coding puzzle and interactions live in
   site.js and puzzle.js, but you usually do not need to edit those.

WHAT'S HERE
-----------
- Animated original pink-cheeked doodle mascot that reacts to tapping
- Nomia C++ character profile
- Real browser-side logic checking 1022 sequences for the W-block puzzle:
  condition ONLY (not full arbitrary C++ compiler). WA / CE / AC, hint and skip
- Mystery gift box, 19 optional secret notes, three-pair matching game
- EGOI and ICPC ambition celebration, 4 personal photos
- Birthday candle: click, reveal the real photo, confetti
- Full Mongolian birthday letter, edited from one file
- Reduced-motion support, keyboard usable UI; no tracking or backend
- qr.html: print an A6 QR card / save QR as PNG after site hosting

HOW TO PUT ONLINE AND PRINT QR
------------------------------
A QR links to a website URL, not to a local HTML file on Orgio's phone.
Free/simple hosting examples: Netlify Drop (drag the UNZIPPED FOLDER),
GitHub Pages, Cloudflare Pages. Publish the entire folder and verify the link.
Then open <YOUR LIVE WEBSITE>/qr.html in the browser. It fills in its own hosted
URL by default; check that it is CORRECT. Click Generate QR, then Print card or
Save PNG. Test the QR scan with another phone before printing.

IMPORTANT PRIVACY NOTE
----------------------
This site contains private pictures. It is NOT password protected. Noindex is
not real access control; anyone with the link can see the photos and letter.
Only publish and share it if you're comfortable with that risk.

BROWSER SUPPORT
---------------
Works as plain static HTML/CSS/JS, no build step, no npm, no Lovable credits.
For best results, use the latest Chrome, Safari, or Firefox. Fonts may fall back
to system fonts without internet; functionality and QR generation remain local.

THIRD-PARTY LICENSE
-------------------
The vendor/qr-local.js QR-encoding implementation is based on QRCode for
JavaScript (Kazuhiko Arase), MIT license; packaged by qrcode-terminal.
All other site visuals and code here are standalone.
