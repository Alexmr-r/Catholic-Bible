import Foundation
import AppKit

let url = URL(fileURLWithPath: "assets/logo-transparent.png")
if let image = NSImage(contentsOf: url) {
    let originalSize = image.size
    // We want the original image to take up 25% of the new canvas
    let newSize = NSSize(width: originalSize.width * 4, height: originalSize.height * 4)
    
    let newImage = NSImage(size: newSize)
    newImage.lockFocus()
    // Clear background
    NSColor.clear.set()
    NSRect(origin: .zero, size: newSize).fill()
    
    // Draw original image in center
    let centerRect = NSRect(
        x: (newSize.width - originalSize.width) / 2,
        y: (newSize.height - originalSize.height) / 2,
        width: originalSize.width,
        height: originalSize.height
    )
    image.draw(in: centerRect)
    newImage.unlockFocus()
    
    // Save to splash-logo.png
    if let tiff = newImage.tiffRepresentation, let bitmap = NSBitmapImageRep(data: tiff) {
        if let pngData = bitmap.representation(using: .png, properties: [:]) {
            try? pngData.write(to: URL(fileURLWithPath: "assets/splash-logo.png"))
            print("Successfully explicitly padded image!")
        }
    }
} else {
    print("Failed to load image")
}
