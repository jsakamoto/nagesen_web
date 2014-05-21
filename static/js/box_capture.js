function capture_img(box_id, img_id) {
  var canvas = document.getElementById(box_id);
  if (canvas.getContext) {
    var context = canvas.getContext('2d');

    var img = document.getElementById(img_id);
    img.width  = canvas.width;
    img.height = canvas.height;
    img.style.border = canvas.style.border;
    img.src = canvas.toDataURL();
    window.open(img.src, "", "width="+canvas.width+",height="+canvas.height+",location=no");
  }
}
