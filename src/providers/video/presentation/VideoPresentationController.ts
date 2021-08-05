import { PropertyValues, ReactiveElement } from 'lit';

import {
  DisposalBin,
  listen,
  redispatchEvent,
  vdsEvent
} from '../../../base/events';
import { Logger } from '../../../base/logger';
import { DEV_MODE } from '../../../env';
import { isFunction, isNil, noop } from '../../../utils/unit';

export type VideoPresentationControllerHost = ReactiveElement & {
  readonly videoElement: HTMLVideoElement | undefined;
};

/**
 * Contains the logic for handling presentation modes on Safari. This class is used by
 * the `VideoFullscreenController` as a fallback when the native Fullscreen API is not
 * available (ie: iOS Safari).
 *
 * @example
 * ```ts
 * import { LitElement } from 'lit';
 * import { VideoPresentationController } from '@vidstack/elements';
 *
 * class MyElement extends LitElement {
 *   get videoElement(): HTMLVideoElement | undefined {
 *     return this.videoEl;
 *   }
 *
 *   presentationController = new VideoPresentationController(this);
 * }
 * ```
 */
export class VideoPresentationController {
  protected readonly _logger!: Logger;

  protected readonly _listenerDisposal: DisposalBin;

  constructor(protected readonly _host: VideoPresentationControllerHost) {
    if (DEV_MODE) {
      this._logger = new Logger(_host, { owner: this });
    }

    this._listenerDisposal = new DisposalBin(
      _host,
      DEV_MODE && { name: 'listenerDisposal', owner: this }
    );

    const firstUpdated = (_host as any).firstUpdated;
    (_host as any).firstUpdated = (changedProperties: PropertyValues) => {
      firstUpdated?.call(_host, changedProperties);
      this._listenerDisposal.add(
        this._addPresentationModeChangeEventListener()
      );
    };

    _host.addController({
      hostDisconnected: this._handleHostDisconnected.bind(this)
    });
  }

  protected _handleHostDisconnected() {
    this.setPresentationMode('inline');
    this._listenerDisposal.empty();
  }

  /**
   * The current presentation mode, possible values include `inline`, `picture-in-picture` and
   * `fullscreen`. Only available in Safari.
   *
   * @default undefined
   * @link https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1631913-webkitpresentationmode
   */
  get presentationMode(): WebKitPresentationMode | undefined {
    return this._host.videoElement?.webkitPresentationMode;
  }

  /**
   * Whether the current `presentationMode` is `inline`.
   */
  get isInlineMode() {
    return this.presentationMode === 'inline';
  }

  /**
   * Whether the current `presentationMode` is `picture-in-picture`.
   */
  get isPictureInPictureMode() {
    return this.presentationMode === 'inline';
  }

  /**
   * Whether the current `presentationMode` is `fullscreen`.
   */
  get isFullscreenMode() {
    return this.presentationMode === 'fullscreen';
  }

  /**
   * Whether the presentation mode API is available.
   *
   * @link https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1628805-webkitsupportsfullscreen
   */
  get isSupported() {
    return isFunction(this._host.videoElement?.webkitSetPresentationMode);
  }

  setPresentationMode(mode: WebKitPresentationMode) {
    this._host.videoElement?.webkitSetPresentationMode?.(mode);
  }

  /**
   * @returns Stop listening function.
   */
  protected _addPresentationModeChangeEventListener(): () => void {
    if (!this.isSupported || isNil(this._host.videoElement)) return noop;

    if (DEV_MODE) {
      this._logger.info('adding `webkitpresentationmodechanged` listener');
    }

    return listen(
      this._host.videoElement,
      // @ts-expect-error
      'webkitpresentationmodechanged',
      this._handlePresentationModeChange.bind(this)
    );
  }

  protected _handlePresentationModeChange(event: Event) {
    if (DEV_MODE) {
      this._logger
        .infoGroup('presentation mode change')
        .appendWithLabel('Event', event)
        .end();
    }

    redispatchEvent(this._host, event);
    this._host.dispatchEvent(
      vdsEvent('vds-video-presentation-change', {
        detail: this.presentationMode!,
        originalEvent: event
      })
    );
  }
}
