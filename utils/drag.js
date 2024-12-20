(L.PathDraggable = L.Draggable.extend({
  initialize: function (t) {
    (this._path = t),
      (this._canvas = t._map.getRenderer(t) instanceof L.Canvas);
    var a = this._canvas
      ? this._path._map.getRenderer(this._path)._container
      : this._path._path;
    L.Draggable.prototype.initialize.call(this, a, a, !0);
  },
  _updatePosition: function () {
    var t = { originalEvent: this._lastEvent };
    this.fire("drag", t);
  },
  _onDown: function (t) {
    var a = t.touches ? t.touches[0] : t;
    (this._startPoint = new L.Point(a.clientX, a.clientY)),
      (this._canvas &&
        !this._path._containsPoint(
          this._path._map.mouseEventToLayerPoint(a)
        )) ||
        L.Draggable.prototype._onDown.call(this, t);
  },
})),
  (L.Handler.PathDrag = L.Handler.extend({
    initialize: function (t) {
      this._path = t;
    },
    getEvents: function () {
      return {
        dragstart: this._onDragStart,
        drag: this._onDrag,
        dragend: this._onDragEnd,
      };
    },
    addHooks: function () {
      this._draggable || (this._draggable = new L.PathDraggable(this._path)),
        this._draggable.on(this.getEvents(), this).enable(),
        L.DomUtil.addClass(this._draggable._element, "leaflet-path-draggable");
    },
    removeHooks: function () {
      this._draggable.off(this.getEvents(), this).disable(),
        L.DomUtil.removeClass(
          this._draggable._element,
          "leaflet-path-draggable"
        );
    },
    moved: function () {
      return this._draggable && this._draggable._moved;
    },
    _onDragStart: function () {
      (this._startPoint = this._draggable._startPoint),
        this._path.closePopup().fire("movestart").fire("dragstart");
    },
    _onDrag: function (t) {
      var a = this._path,
        n =
          t.originalEvent.touches && 1 === t.originalEvent.touches.length
            ? t.originalEvent.touches[0]
            : t.originalEvent,
        i = L.point(n.clientX, n.clientY),
        e = a._map.layerPointToLatLng(i);
      (this._offset = i.subtract(this._startPoint)),
        (this._startPoint = i),
        this._path.eachLatLng(this.updateLatLng, this),
        a.redraw(),
        (t.latlng = e),
        (t.offset = this._offset),
        a.fire("drag", t),
        (t.latlng = this._path.getCenter
          ? this._path.getCenter()
          : this._path.getLatLng()),
        a.fire("move", t);
    },
    _onDragEnd: function (t) {
      this._path._bounds && this.resetBounds(),
        this._path.fire("moveend").fire("dragend", t);
    },
    latLngToLayerPoint: function (t) {
      return this._path._map
        .project(L.latLng(t))
        ._subtract(this._path._map.getPixelOrigin());
    },
    updateLatLng: function (t) {
      var a = this.latLngToLayerPoint(t);
      a._add(this._offset);
      var n = this._path._map.layerPointToLatLng(a);
      (t.lat = n.lat), (t.lng = n.lng);
    },
    resetBounds: function () {
      (this._path._bounds = new L.LatLngBounds()),
        this._path.eachLatLng(function (t) {
          this._bounds.extend(t);
        });
    },
  })),
  L.Path.include({
    eachLatLng: function (t, a) {
      a = a || this;
      var n = function (i) {
        for (var e = 0; e < i.length; e++)
          L.Util.isArray(i[e]) ? n(i[e]) : t.call(a, i[e]);
      };
      n(this.getLatLngs ? this.getLatLngs() : [this.getLatLng()]);
    },
  }),
  L.Path.addInitHook(function () {
    (this.dragging = new L.Handler.PathDrag(this)),
      this.options.draggable &&
        this.once("add", function () {
          this.dragging.enable();
        });
  });
//# sourceMappingURL=/sm/64e2c389d94f4090020fd084c3350fecd4046130f96cd426a924d9482c6f5bdd.map
