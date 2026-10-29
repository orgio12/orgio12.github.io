"""Generate a print-quality QR code and 'Little secret' invitation card.
Usage: python make_qr.py https://your-real-published-url/
Only print the resulting card after opening the URL on your phone to verify it.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import qrcode, sys
URL = sys.argv[1] if len(sys.argv)>1 else 'https://orgio12.github.io/birthday/nomiapc/'
root = Path(__file__).resolve().parent
qr = qrcode.QRCode(version=None,error_correction=qrcode.constants.ERROR_CORRECT_H,box_size=24,border=4)
qr.add_data(URL)
qr.make(fit=True)
img = qr.make_image(fill_color='#11182b',back_color='white').convert('RGB')
img.save(root/'qr-code.png')
W,H=1200,1500
canvas=Image.new('RGB',(W,H),'#fffaf7');d=ImageDraw.Draw(canvas)
try:
  title=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',89)
  subtitle=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',38)
  small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',24)
  mono=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',31)
except OSError:
  title=subtitle=small=mono=ImageFont.load_default()
def center(y,text,font,fill):
 bbox=d.textbbox((0,0),text,font=font);d.text(((W-(bbox[2]-bbox[0]))/2,y),text,font=font,fill=fill)
d.rounded_rectangle((70,68,W-70,H-75),radius=45,fill='#ffffff',outline='#eacfd8',width=4)
d.rounded_rectangle((110,108,W-110,164),radius=27,fill='#101a30')
center(120,'// PRIVATE BIRTHDAY INVITATIONAL',small,'#a6f2d7')
center(235,'Little secret',title,'#151f35')
center(356,'A little challenge. A hidden prize.',subtitle,'#8e7285')
center(423,'One special contestant.',subtitle,'#8e7285')
# High-contrast, no decorative marks over the QR area.
size=755
q=img.resize((size,size),Image.Resampling.NEAREST)
canvas.paste(q,((W-size)//2,496))
d.rounded_rectangle((355,1288,845,1354),radius=32,fill='#eafaf4',outline='#b9e7da',width=3)
center(1306,'SCAN ME  <3',mono,'#263b40')
center(1370,'Not ICPC.  NomiaPC.',small,'#7e879c')
canvas.save(root/'qr-print-card.png')
print('QR destination:',URL)
print('Created:',root/'qr-code.png',root/'qr-print-card.png')
