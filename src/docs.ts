/**
 * ## EventCatalog SDK
 *
 * The EventCatalog SDK provides methods to interact with domains, services, and messages.
 *
 * ## Installation
 *
 * ```sh
 * npm install @eventcatalog/sdk
 * ```
 *
 * ## Usage
 *
 * ```ts
 * import utils from '@eventcatalog/sdk';
 *
 * const { getEvent } = utils(PATH_TO_CATALOG);
 *
 * // Get an event by the id
 * const event = getEvent('event-name');
 *
 * // Get an event by the id and it's version
 * const event = getEvent('event-name', '0.3.4');
 * ```
 *
 * @module docs
 */
export * from './events';
export * from './services';
export * from './commands';
