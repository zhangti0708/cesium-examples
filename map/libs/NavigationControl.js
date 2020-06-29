/**
 * Created by bingqixuan on 2018/9/26.
 */
'use strict';

const NavigationControl = function (viewer) {
    this._viewer = viewer;
    this._container = window.document.createElement('div');
    this._container.className = 'cesium-ctrl gvi-ctrl-group';
    this._container.addEventListener('contextmenu', (e) => e.preventDefault());
    this._viewer._element.appendChild(this._container);

    this._zoomInButton = this._createButton('cesium-ctrl-icon cesium-ctrl-zoom-in', '放大', () => this._viewer.camera.zoomIn());
    this._zoomOutButton = this._createButton('cesium-ctrl-icon cesium-ctrl-zoom-out', '缩小', () => this._viewer.camera.zoomOut());
    this._compass = this._createButton('cesium-ctrl-icon cesium-ctrl-compass', 'Reset North', () => this._viewer.camera.setView({
        orientation: {
            heading: 0.0,
            pitch: -Math.PI / 4,
            roll: 0.0
        }
    }));
    this._compassArrow = window.document.createElement('span');
    this._compassArrow.className = 'cesium-ctrl-compass-arrow';
    this._compass.appendChild(this._compassArrow);

    this._event = ()=>{
        const rotate = `rotate(${this._viewer.camera.heading * (180 / Math.PI)}deg)`;
        this._compassArrow.style.transform = rotate;
    };
    this._viewer.scene.postRender.addEventListener(this._event);
};

NavigationControl.prototype._createButton = function (className, ariaLabel, fn) {
    let button = window.document.createElement('button');
    button.className = className;
    this._container.appendChild(button);
    button.type = 'button';
    button.setAttribute('aria-label', ariaLabel);
    button.addEventListener('click', fn);
    return button;
};

NavigationControl.prototype.destroy = function () {
    this._viewer._element.removeChild(this._container);
    this._viewer.scene.postRender.removeEventListener(this._event);
};

module.exports = {
    NavigationControl: NavigationControl
};