(function() {
    "use strict";

    // From https://stackoverflow.com/questions/1140189/converting-latitude-and-longitude-to-decimal-values
    function ConvertDMSToDD(degrees, minutes, seconds, direction) {
        var dd = degrees + minutes/60 + seconds/(60*60);

        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        } // Don't do anything for N or E
        return dd;
    }

    document.getElementById('image_input').addEventListener('change', async function(e) {
        if (e.target.files.length > 0) {
            var file = e.target.files[0];
            console.log('Type:', file.type);

            var reader = new FileReader();
            reader.onload = function(event) {
                var exifData;
                if (file.type === 'image/heic') {
                    exifData = findEXIFinHEIC(reader.result);
                } else if (file.type === 'image/jpeg') {
                    exifData = findEXIFinJPEG(reader.result);
                } else {
                    console.log('Unsupported file type:', file.type);
                    return;
                }

                var lat = ConvertDMSToDD(
                    exifData.GPSLatitude[0],
                    exifData.GPSLatitude[1],
                    exifData.GPSLatitude[2],
                    exifData.GPSLatitudeRef
                );
                var lng = ConvertDMSToDD(
                    exifData.GPSLongitude[0],
                    exifData.GPSLongitude[1],
                    exifData.GPSLongitude[2],
                    exifData.GPSLongitudeRef
                );
                var ele = exifData.GPSAltitude ? Math.trunc(exifData.GPSAltitude) : 0;
                var azi = exifData.GPSImgDirection ? exifData.GPSImgDirection : 0;
                var fov = 45;

                document.getElementById('peakfinder_frame').src = `https://www.peakfinder.com/?lat=${lat}&lng=${lng}&ele=${ele}&azi=${azi}&fov=${fov}`;
            };
            reader.readAsArrayBuffer(file);

            if (await HeicTo.isHeic(file)) {
                const jpeg = await HeicTo({
                    blob: file,
                    type: "image/jpeg",
                    quality: 0.5
                });
                document.getElementById('image_preview').src = URL.createObjectURL(jpeg);
            } else {
                var imageObjectUrl = URL.createObjectURL(file);
                document.getElementById('image_preview').src = imageObjectUrl;
            }
        }
        console.log(e);
        console.log('Image input changed:', e.target.files);
    }, false);

    document.getElementById('opacity_slider').addEventListener('input', function(e) {
        var opacity = e.target.value;
        document.getElementById('peakfinder_frame').style.opacity = opacity / 100;
    }, false);
})();