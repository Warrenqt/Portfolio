# Portrait background removal

Mode: built-in imagegen, with `transparent_background: true`.

Input: `Profile pictures/Profile.jpg`.

Saved cutout: `Profile pictures/Profile-cutout.png`.

Website asset: `public/warren-hero.png`. Its alpha mask is also used to generate `public/warren-halftone.svg` and the animated canvas particles.

## Final prompt

Edit the provided photograph: BACKGROUND REMOVAL ONLY. Output a transparent RGBA PNG cutout of the exact same person, with the exact same square framing and subject position. Remove all of the tiled wall, window and every background pixel. Preserve the actual face and identity, pose, expression, original warm afternoon lighting and photographic grain, fine hair edges, sunglasses resting on hair, ear stud, striped open shirt, white t-shirt, necklace, hand, fingers, and phone. Keep every part of the foreground subject and the phone, including the original lower/left crop. Do not redraw, beautify, restyle, relight, add details, change clothing, or change facial features. Maintain the original image bounds and original relative size of the subject. No added shadow, no background color, no checkerboard baked into the image. Transparent background.
