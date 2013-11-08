class ImageExporter

  constructor: (@meta_data=null, @root_dom=('body'),svg_selector='svg') ->
    @root_dom    = $(@root_dom)
    @width       = 500
    @height      = 500
    @svg_element  = @root_dom.find(svg_selector)[0]
    @_populate_data() if @meta_data is null

  ###
  TODO: _clean_images will cleanup images in svg
  1. use CORS proxy
  2. maybe cleanup raphael's link namespace:
    `svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'this.xml');`
  ###
  _clean_images: (svg) ->
    return svg.replace(/<image.*?<\/image>/g,"")

  _populate_data: () ->
    @meta_data = []
    @meta_data.push(new Date().toLocaleString())
    @meta_data.push("student id: 234433")
    @meta_data.push("Good work.  Next time read the chapters first.")


  _add_meta_data: (svg_elem) ->
    text_box = $('<text>').attr
      x: 20
      y: 10

    text_size    = 14
    line_height  = text_size * 1.4
    y_val        = 0
    text_color   = '#442233'

    for data in @meta_data
      y_val = y_val + line_height

      data_span = $('<tspan>').attr
        'x': 0
        'y': y_val
        'font-size': text_size
        'fill': text_color
      data_span.append(data)
      text_box.append(data_span)
    
    svg_elem.append(text_box)

  get_svg: () ->
    svg_element = $(@svg_element).clone()
    svg_element.attr({width: 1000, height:1000}) 
    $(svg_element.find('g')[0]).attr({'transform': 'translate(0,120)'})
    @_add_meta_data(svg_element)
    svg_div        = $('<div>').append(svg_element)
    # TODO: remove usunsed div?
    svg_div.html().replace(/\s+href=/g,'xlink:href=');

  get_png: () ->
    render_id     = 'tmp_rendering_canvas'
    render_canvas = $("<canvas id='#{render_id}' style='display:none;' width=#{@width} height=#{@height}></canvas>")[0]
    @root_dom.append(render_canvas);
    safe_svg      = @_clean_images(@get_svg())
    canvg(render_id, safe_svg)
    data = render_canvas.toDataURL()
    $("##{render_id}").remove()
    data

  append_png: (target=@root_dom) ->
    img = $("<img>")
    img.attr('src',@get_png());
    $(target).append(img);

  append_svg: (target=@root_dom) ->
    $(target).append(@get_svg());

# export to global namespace
root = exports ? this
root.ImageExporter = ImageExporter
