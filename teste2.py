import fitz  # PyMuPDF
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider
import io

input_pdf = "input.pdf"
doc = fitz.open(input_pdf)

# Zoom in (improves resolution)
zoom = 1
mat = fitz.Matrix(zoom, zoom)

# Function to display the page based on slider input
def display_page(page_num):
    page = doc[page_num]
    pix = page.get_pixmap(matrix=mat)
    img_data = pix.tobytes("png")
    
    img = plt.imread(io.BytesIO(img_data))
    ax.clear()  # Clear the previous image
    ax.imshow(img)
    ax.set_title(f"Page {page_num + 1}")
    plt.draw()

# Create figure and axis
fig, ax = plt.subplots()

# Create a slider to select the page
ax_slider = plt.axes([0.1, 0.01, 0.8, 0.03])  # [left, bottom, width, height]
page_slider = Slider(ax_slider, 'Page', 0, len(doc) - 1, valinit=0, valstep=1)

# Display the first page
display_page(0)

# Update the display when the slider value changes
def update(val):
    page_num = int(page_slider.val)
    display_page(page_num)

page_slider.on_changed(update)

plt.show()
