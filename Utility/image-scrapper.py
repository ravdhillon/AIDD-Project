from google_images_download import google_images_download

response = google_images_download.googleimagesdownload()
arguments = {"keywords":"Car dent","limit":"95", "format": "jpg"}
paths = response.download(arguments)
print(paths)