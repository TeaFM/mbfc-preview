# Vendored motion libraries

The versions `docs/handoffs/2026-11-03-mbfc-website/05-our-adaptation.md` section 5 names, read from the npm registry on 3 November 2026 and fetched from it on 4 November 2026. Each tarball was downloaded with curl into an empty scratch folder, extracted with tar, and the files below were copied out of `package/dist/` unchanged. Their licences are in `LICENSES.md` beside them. `tests/test_site_mbfc.py` reads the last column of the table and checks each file's sha256 against it.

| File | Package | Version | Tarball | Tarball sha256 | File sha256 |
|---|---|---|---|---|---|
| `gsap.min.js` | gsap | 3.15.0 | https://registry.npmjs.org/gsap/-/gsap-3.15.0.tgz | d2e33ad202d4811e9084883f7ff9a27967ac4095caef51ca4c9d20697a253b1c | 92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb |
| `ScrollTrigger.min.js` | gsap | 3.15.0 | https://registry.npmjs.org/gsap/-/gsap-3.15.0.tgz | d2e33ad202d4811e9084883f7ff9a27967ac4095caef51ca4c9d20697a253b1c | b0b14d67b55b0c43c756ac0b106cfcb09d0879945f6ead64451065b0672916a2 |
| `SplitText.min.js` | gsap | 3.15.0 | https://registry.npmjs.org/gsap/-/gsap-3.15.0.tgz | d2e33ad202d4811e9084883f7ff9a27967ac4095caef51ca4c9d20697a253b1c | 419f7027a5f086a12cb7988736d8fdd3a6ed2200229661de25b6628ca7ced344 |
| `Flip.min.js` | gsap | 3.15.0 | https://registry.npmjs.org/gsap/-/gsap-3.15.0.tgz | d2e33ad202d4811e9084883f7ff9a27967ac4095caef51ca4c9d20697a253b1c | cbe3ca726350f8d230da38a14ce2384e7772e05a45cee6144dd7fe6dde868c2f |
| `ScrambleTextPlugin.min.js` | gsap | 3.15.0 | https://registry.npmjs.org/gsap/-/gsap-3.15.0.tgz | d2e33ad202d4811e9084883f7ff9a27967ac4095caef51ca4c9d20697a253b1c | a2cfaa7223231459dfde37e9385413ee6df065f18121e946ffdde694f8b11f01 |
| `lenis.min.js` | lenis | 1.3.27 | https://registry.npmjs.org/lenis/-/lenis-1.3.27.tgz | 0a2437de050959246edd645a2ffa8b50a6ff6b80d98f6d960f1b4557a4c4209e | 80f53e77f1c13e379fc246d2b5e299188e20bcb2b2fe7ebb13e8e8c7563a6da7 |

The registry's own shasum (sha1) of the tarballs, for a check against `npm view`: gsap 7851baaffc77642f2db3b1749d3634f9b5a19d14, lenis 9c714ca34741bb29cd6180ab4fc3634ece6805b3.
