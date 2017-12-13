(function (window, document) {
    'use strict';

    function YAudioPlayerSkin () {
        this.elements = {
            playerContainer: null,
            loader: null,
            controlsContainer: null,
            playPauseBtn: null,
            progressPin: null,
            progressSlider: null,
            progressBuffer: null,
            progressTooltip: null,
            volumeControls: null,
            volumeContainer: null,
            volumeBtn: null,
            volumePin: null,
            volumeSlider: null,
            volumeProgress: null,
            currentTime: null,
            totalTime: null,
            playlist: null
        };

        this._callbacks = {
            stateChange: [],
            seek: [],
            volumeChange: [],
            trackChanged: []
        };

        this._flexboxSuppoted = typeof document.createElement("p").style.flex !== 'undefined';
        this._playerState = YAudioPlayerSkin.STATE_UNLOADED;
        this._trackLength = 0;
        this._currentTime = 0;
        this._volume = 1;
        this._volumeControl = null;
        this._trackProgressControl = null;
        this._playlistTracks = [];
    }

    YAudioPlayerSkin.STATE_UNLOADED  = 'unloaded';
    YAudioPlayerSkin.STATE_LOADED    = 'loaded';
    YAudioPlayerSkin.STATE_PAUSED    = 'paused';
    YAudioPlayerSkin.STATE_PLAY      = 'playing';

    YAudioPlayerSkin.prototype = {
        init: function () {
            var _self = this;

            // Loader
            this.elements.loader = createEl('div', {
                className: 'loading',
                innerHTML: ['<div class="spinner"></div>'].join('')
            });

            // Time controls
            this.elements.currentTime = createEl('span', {
                className: 'current-time',
                innerHTML: '00:00'
            });

            this.elements.progressBuffer = createEl('div', {
                className: 'buffered'
            });

            this.elements.progressPin = createEl('div', {
                className: 'pin'
            });

            this.elements.progressSlider = createEl('div', {
                className: 'yn-progress'
            }, {}, this.elements.progressPin);

            this.elements.progressTooltip = createEl('span', {
                className: 'yn-audio-player-tooltip'
            });

            this.elements.progressSliderContainer = createEl(
                'div',
                { className: 'slider' },
                {'data-direction': 'horizontal'},
                [
                    this.elements.progressSlider,
                    this.elements.progressBuffer,
                    this.elements.progressTooltip
                ]
            );

            this.elements.totalTime = createEl('span', {
                className: 'total-time',
                innerHTML: '00:00'
            });

            this.elements.controlsContainer = createEl('div', {
                className: 'controls'
            }, {}, [
                this.elements.currentTime,
                this.elements.progressSliderContainer,
                this.elements.totalTime
            ]);

            // Playlist
            this.elements.playlistBtn = createEl('div', {
                className: 'playlist-btn',
                innerHTML: [
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
                    '<path fill="#566574" fill-rule="evenodd" d="M17.016 12.984l4.969 3-4.969 3v-6zM2.016 15v-2.016h12.984v2.016h-12.984zM18.984 5.016v1.969h-16.969v-1.969h16.969zM18.984 9v2.016h-16.969v-2.016h16.969z"></path>',
                    '</svg>'].join('')
            });

            this.elements.playlist = createEl('div', {
                className: 'playlist hidden',
                innerHTML: '<ul></ul>'
            });

            // Volume controls
            this.elements.volumeBtn = createEl('div', {
                className: 'volume-btn',
                innerHTML: [
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
                    '<path fill="#566574" fill-rule="evenodd" d="M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z" id="speaker"></path>',
                    '</svg>'].join('')
            });

            this.elements.volumePin = createEl('div', {
                className: 'pin'
            }, {'data-method': 'changeVolume'});

            this.elements.volumeProgress = createEl('div', {
                className: 'yn-progress'
            }, {}, this.elements.volumePin);

            this.elements.volumeSlider = createEl('div', {
                className: 'slider'
            }, {'data-direction': 'vertical'}, this.elements.volumeProgress);

            this.elements.volumeControls = createEl('div', {
                className: 'volume-controls hidden'
            }, {}, this.elements.volumeSlider);

            this.elements.volumeContainer = createEl('div', {
                className: 'volume'
            }, {}, [
                this.elements.volumeBtn,
                this.elements.volumeControls
            ]);

            this.elements.playPauseBtn = createEl('div', {
                className: 'play-pause-btn',
                innerHTML: [
                    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">',
                    '<path fill="#566574" fill-rule="evenodd" d="M18 12L0 24V0" class="play-pause-icon" id="playPause"></path>' +
                    '</svg>'].join('')
            }, {});

            this.elements.playerContainer = createEl('div', {
                className: 'yn-audio'
            }, {}, [
                this.elements.loader,
                this.elements.playPauseBtn,
                this.elements.controlsContainer,
                this.elements.volumeContainer
            ]);

            this.elements.playerWrapper = createEl(
                'div',
                { className: 'yn-audio-player' + (this._flexboxSuppoted ? '':' no-flex') },
                {},
                [this.elements.playerContainer]
            );

            this.elements.volumeBtn.addEventListener('click', function (ev) {
                this.classList.toggle('open');
                _self.elements.volumeControls.classList.toggle('hidden');

                if (window.innerHeight < 250) {
                    _self.elements.volumeControls.style.bottom = '-54px';
                    _self.elements.volumeControls.style.left = '28px';
                } else if (_self.elements.playerContainer.offsetTop < 154) {
                    _self.elements.volumeControls.style.bottom = '-145px';
                    _self.elements.volumeControls.style.left = '-3px';
                } else {
                    _self.elements.volumeControls.style.bottom = '35px';
                    _self.elements.volumeControls.style.left = '-3px';
                }
            }, false);

            this.elements.progressSliderContainer.addEventListener('mouseover', function(ev) {
                var rect = this.getBoundingClientRect(),
                    size = this.clientWidth,
                    offset = ev.clientX - rect.left,
                    time = parseInt(_self._trackLength * (offset / size));

                _self.elements.progressTooltip.classList.add('visible');
                _self.elements.progressTooltip.textContent = _self._formatTime(time);
                _self.elements.progressTooltip.style.left = offset + 'px';
            }, false);

            this.elements.progressSliderContainer.addEventListener('mouseleave', function(ev) {
                _self.elements.progressTooltip.classList.remove('visible');
            }, false);

            this.elements.playPauseBtn.addEventListener('click', function (ev) {
                if (_self._playerState === YAudioPlayerSkin.STATE_PLAY) {
                    _self._updatePlayerState(YAudioPlayerSkin.STATE_PAUSED);
                }
                else {
                    _self._updatePlayerState(YAudioPlayerSkin.STATE_PLAY);
                }
            }, false);

            this._trackProgressControl = new CreateSlider(this.elements.progressSliderContainer, this.elements.progressPin);
            this._trackProgressControl.onChange(function (progress) {
                _self.elements.currentTime.textContent = _self._formatTime(_self._trackLength * progress);
                _self._runCallbacks('seek', progress);
            });

            this._volumeControl = new CreateSlider(this.elements.volumeSlider, this.elements.volumePin);
            this._volumeControl.onChange(function (volume) {
                _self._updateVolume(volume);
                _self._runCallbacks('volumeChange', volume);
            });

            return this.elements.playerWrapper;
        },
        setPlayerState: function (state) {
            this._updatePlayerState(state);
        },
        setTrackLength: function (trackLength) {
            if (typeof trackLength !== 'number' || trackLength === Number.POSITIVE_INFINITY) {
                this.elements.totalTime.style.display = 'none';
                trackLength = Number.POSITIVE_INFINITY;
            }

            this._trackLength = trackLength;
            this.elements.totalTime.textContent = this._formatTime(trackLength);
        },
        setTrackProgress: function (seconds) {
            this._currentTime = seconds;
            this._trackProgressControl.setPosition(seconds / this._trackLength);
            this.elements.currentTime.textContent = this._formatTime(seconds);
        },
        setBuffer: function (buffered) {
            if (this._trackLength > 0) {
                for (var i = 0; i < buffered.length; i++) {
                    if (buffered.start(buffered.length - 1 - i) <= this._currentTime) {
                        this.elements.progressBuffer.style.width = (buffered.end(buffered.length - 1 - i) / this._trackLength) * 100 + "%";
                        break;
                    }
                }
            }
        },
        setVolume: function (perc) {
            this._volume = perc;
            this._volumeControl.setPosition(perc);
        },
        getVolume: function () {
            return this._volume;
        },
        onStateChange: function (cb) {
            this._callbacks.stateChange.push(cb);
        },
        onSeek: function (cb) {
            this._callbacks.seek.push(cb);
        },
        onVolumeChange: function (cb) {
            this._callbacks.volumeChange.push(cb);
        },
        onTrackChange: function (cb) {
            this._callbacks.trackChanged.push(cb);
        },
        addToPlaylist: function (name, audioUrl) {
            var _self = this;
            var audio = new Audio(audioUrl);
            var canPlayCb = function (ev) {
                var audioLen = _self._formatTime(audio.duration);
                var item = createEl('li', { innerHTML: name + '<span>' + audioLen + '</span>' });

                _self.elements.playlist.firstElementChild.appendChild(item);

                item.addEventListener('dblclick', function (ev) {
                    _self._runCallbacks('trackChanged', audio);
                });

                this.removeEventListener('canplay', canPlayCb);
            };

            if (this._playlistTracks.length === 0) {
                this.elements.controlsContainer.parentNode.insertBefore(this.elements.playlistBtn, this.elements.controlsContainer.nextSibling);
                this.elements.playerContainer.parentNode.insertBefore(this.elements.playlist, this.elements.playerContainer.nextSibling);

                this.elements.playlistBtn.addEventListener('click', function (ev) {
                    _self.elements.playlist.classList.toggle('hidden');
                });
            }

            audio.addEventListener('canplay', canPlayCb);

            this._playlistTracks.push({
                name: name,
                audio: audio
            });
        },
        _updatePlayerState: function (state) {
            this._playerState = state || YAudioPlayerSkin.STATE_UNLOADED;

            switch (this._playerState) {
                case YAudioPlayerSkin.STATE_LOADED:
                    this.elements.loader.style.display = 'none';
                    this.elements.playPauseBtn.style.display = 'block';
                    break;
                case YAudioPlayerSkin.STATE_PAUSED:
                    this.elements.playPauseBtn.getElementsByTagName('path')[0].setAttribute('d', 'M18 12L0 24V0');
                    this._playerState = YAudioPlayerSkin.STATE_PAUSED;
                    break;
                case YAudioPlayerSkin.STATE_PLAY:
                    this.elements.playPauseBtn.getElementsByTagName('path')[0].setAttribute('d', 'M0 0h6v24H0zM12 0h6v24h-6z');
                    this._playerState = YAudioPlayerSkin.STATE_PLAY;
                    break;
                default:
                    this.elements.loader.style.display = 'block';
                    this.elements.playPauseBtn.style.display = 'none';
            }

            this._runCallbacks('stateChange', this._playerState);
        },
        _formatTime: function (time) {
            var min = Math.floor(time / 60);
            var sec = Math.floor(time % 60);

            return min + ':' + (sec < 10 ? '0' + sec : sec);
        },
        _updateVolume: function (volume) {
            this.speaker = this.speaker || this.elements.volumeBtn.getElementsByTagName('path')[0];

            if (volume >= 0.5) {
                this.speaker.attributes.d.value = 'M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';
            } else if (volume < 0.5 && volume > 0.05) {
                this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
            } else if (volume <= 0.05) {
                this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667';
            }
        },
        _runCallbacks: function (cbName, ev) {
            if (this._callbacks[cbName] && this._callbacks[cbName].length) {
                for (var i = 0; i < this._callbacks[cbName].length; i++) {
                    typeof this._callbacks[cbName][i] === 'function' && this._callbacks[cbName][i](ev);
                }
            }
        }
    };

    // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return {
                YAudioPlayerSkin: YAudioPlayerSkin
            };
        });
    }

    // Add support for CommonJS libraries such as browserify.
    if (typeof exports !== 'undefined') {
        exports.YAudioPlayerSkin = YAudioPlayerSkin;
    }

    // Define globally in case AMD is not available or unused.
    if (typeof window !== 'undefined') {
        window.YAudioPlayerSkin = YAudioPlayerSkin;
    } else if (typeof global !== 'undefined') { // Add to global in Node.js (for testing, etc).
        global.YAudioPlayerSkin = YAudioPlayerSkin;
    }


    /**
     * Creates slider
     *
     * @param {Element} sliderElement
     *         Slider element (the range box of the slider).
     *
     * @param {Element} pinElement
     *         Slider Pin Element (the element which will be dragged between the ranges of the slider);
     */
    function CreateSlider (sliderElement, pinElement) {
        if (!sliderElement || !pinElement) {
            return console.error('You have to set your Slider element & Slider Pin element!');
        }

        this.sliderElement = sliderElement;
        this.pinElement = pinElement;
        this.dragging = false;
        this.dragStartPos = 0;
        this._currentPosition = 0;
        this._direction = sliderElement.getAttribute('data-direction') || 'horizontal';
        this._onDraggCallback = [];

        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);

        this.pinElement.addEventListener('mousedown', this._onMouseDown, false);
        this.pinElement.addEventListener('touchstart', this._onMouseDown, false);
        this.sliderElement.addEventListener('click', this._onMouseMove, false);
        window.addEventListener('mouseup', this._onMouseUp, false);
        window.addEventListener('touchend', this._onMouseUp, false);
    }

    CreateSlider.prototype = {
        onChange: function (fnCallback) {
            if (typeof fnCallback === 'function') {
                this._onDraggCallback.push(fnCallback);
            }
        },
        setPosition: function (pos) {
            if (Number(pos) < 1 && Number(pos) >= 0) {
                this.sliderElement.firstElementChild.style[this._direction === 'horizontal' ? 'width' : 'height'] = (pos * 100) + '%';
                this._currentPosition = pos;
            }
        },
        getPosition: function () {
            return this._currentPosition;
        },
        destroy: function () {
            this.pinElement.removeEventListener('mousedown', this._onMouseDown, false);
            this.pinElement.removeEventListener('touchstart', this._onMouseDown, false);
            this.sliderElement.removeEventListener('click', this._onMouseMove, false);
            window.removeEventListener('mouseup', this._onMouseUp, false);
            window.removeEventListener('touchend', this._onMouseUp, false);
        },

        _onMouseDown: function (ev) {
            if (!this.dragging) {
                window.addEventListener('mousemove', this._onMouseMove, false);
                window.addEventListener('touchmove', this._onMouseMove, false);

                this.draggedElement = ev.target;
                this.dragging = true;
                this.dragStartPos = ev.clientY;
            }
        },

        _onMouseMove: function (ev) {
            var pinPos = 0;

            if (this._inRange(ev)) {
                pinPos = this._calcPinPosition(ev);
                this.sliderElement.firstElementChild.style[this._direction === 'horizontal' ? 'width' : 'height'] =  (pinPos * 100) + '%';
                this._currentPosition = pinPos;
                this._runCallbacks(pinPos, this._direction === 'horizontal' ? ev.clientX : ev.clientY);
            }
        },

        _onMouseUp: function (ev) {
            window.removeEventListener('mousemove', this._onMouseMove, false);
            window.removeEventListener('touchmove', this._onMouseMove, false);

            this.dragging = false;
        },

        _calcPinPosition: function (ev) {
            var rect = this.sliderElement.getBoundingClientRect(),
                size = this._direction === 'horizontal' ? this.sliderElement.clientWidth : this.sliderElement.clientHeight,
                offset = (this._direction === 'horizontal' ? ev.clientX : ev.clientY) - (this._direction === 'horizontal' ? rect.left : rect.top);

            return parseFloat(this._direction === 'horizontal' ? offset / size : 1 - offset / size).toFixed(2);
        },

        _inRange: function (ev) {
            var rect = this.sliderElement.getBoundingClientRect();
            var min = this._direction === 'horizontal' ? rect.left : rect.top;
            var max = min + (this._direction === 'horizontal' ? this.sliderElement.offsetWidth : this.sliderElement.offsetHeight);
            var distance = this._direction === 'horizontal' ? ev.clientX : ev.clientY;

            return min < distance && max > distance;
        },

        _runCallbacks: function (distance, currPos) {
            var _self = this;

            this._onDraggCallback.forEach(function (cb) {
                cb(distance, _self.dragStartPos, currPos, _self._direction);
            });
        }
    };


    /**
     * Creates an element and applies properties.
     *
     * @param {string} [tagName='div']
     *         Name of tag to be created.
     *
     * @param {Object} [properties={}]
     *         Element properties to be applied.
     *
     * @param {Object} [attributes={}]
     *         Element attributes to be applied.
     *
     * @param {Element|Array<Element>} [content]
     *         Contents for the element
     *
     * @return {Element}
     *         The element that was created.
     */
    function createEl(tagName, properties, attributes, content) {
        var el;

        tagName = tagName || 'div';
        properties = properties || {};
        attributes = attributes || {};
        el = document.createElement(tagName);

        Object.getOwnPropertyNames(properties).forEach(function(propName) {
            var val = properties[propName];

            if (propName.indexOf('aria-') !== -1 || propName === 'role' || propName === 'type') {
                el.setAttribute(propName, val);
            } else if (propName === 'textContent') {
                el.textContent = val;
            } else {
                el[propName] = val;
            }
        });

        Object.getOwnPropertyNames(attributes).forEach(function(attrName) {
            el.setAttribute(attrName, attributes[attrName]);
        });

        if (content) {
            (Array.isArray(content) ? content : [content]).map(function (node) {
                if(!!node && typeof node === 'object' && node.nodeType === 1) {
                    el.appendChild(node);
                }
            });
        }

        return el;
    }
})(window, document);
