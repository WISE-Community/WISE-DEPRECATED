(function() {
  var ImageExporter, root;

  ImageExporter = (function() {

    function ImageExporter(meta_data, root_dom, svg_selector) {
      this.meta_data = meta_data != null ? meta_data : null;
      this.root_dom = root_dom != null ? root_dom : 'body';
      if (svg_selector == null) svg_selector = 'svg';
      this.root_dom = $(this.root_dom);
      this.width = 500;
      this.height = 500;
      this.svg_element = this.root_dom.find(svg_selector)[0];
      if (this.meta_data === null) this._populate_data();
    }

    /*
      TODO: _clean_images will cleanup images in svg
      1. use CORS proxy
      2. maybe cleanup raphael's link namespace:
        `svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'this.xml');`
    */

    ImageExporter.prototype._clean_images = function(svg) {
      return svg.replace(/<image.*?<\/image>/g, "");
    };

    ImageExporter.prototype._populate_data = function() {
      this.meta_data = [];
      this.meta_data.push(new Date().toLocaleString());
      this.meta_data.push("student id: 234433");
      return this.meta_data.push("Good work.  Next time read the chapters first.");
    };

    ImageExporter.prototype._add_meta_data = function(svg_elem) {
      var data, data_span, line_height, text_box, text_color, text_size, y_val, _i, _len, _ref;
      text_box = $('<text>').attr({
        x: 20,
        y: 10
      });
      text_size = 14;
      line_height = text_size * 1.4;
      y_val = 0;
      text_color = '#442233';
      _ref = this.meta_data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        y_val = y_val + line_height;
        data_span = $('<tspan>').attr({
          'x': 0,
          'y': y_val,
          'font-size': text_size,
          'fill': text_color
        });
        data_span.append(data);
        text_box.append(data_span);
      }
      return svg_elem.append(text_box);
    };

    ImageExporter.prototype.get_svg = function() {
      var svg_div, svg_element;
      svg_element = $(this.svg_element).clone();
      svg_element.attr({
        width: 1000,
        height: 1000
      });
      $(svg_element.find('g')[0]).attr({
        'transform': 'translate(0,120)'
      });
      this._add_meta_data(svg_element);
      svg_div = $('<div>').append(svg_element);
      return svg_div.html().replace(/\s+href=/g, 'xlink:href=');
    };

    ImageExporter.prototype.get_png = function() {
      var data, render_canvas, render_id, safe_svg;
      render_id = 'tmp_rendering_canvas';
      render_canvas = $("<canvas id='" + render_id + "' style='display:none;' width=" + this.width + " height=" + this.height + "></canvas>")[0];
      this.root_dom.append(render_canvas);
      safe_svg = this._clean_images(this.get_svg());
      canvg(render_id, safe_svg);
      data = render_canvas.toDataURL();
      $("#" + render_id).remove();
      return data;
    };

    ImageExporter.prototype.append_png = function(target) {
      var img;
      if (target == null) target = this.root_dom;
      img = $("<img>");
      img.attr('src', this.get_png());
      return $(target).append(img);
    };

    ImageExporter.prototype.append_svg = function(target) {
      if (target == null) target = this.root_dom;
      return $(target).append(this.get_svg());
    };

    return ImageExporter;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.ImageExporter = ImageExporter;

}).call(this);
