/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { env } from '../../../base/common/process.js';
import { IProductConfiguration } from '../../../base/common/product.js';
import { ISandboxConfiguration } from '../../../base/parts/sandbox/common/sandboxTypes.js';
import { loadFromFileSystem } from './che/product.js';
/**
 * @deprecated It is preferred that you use `IProductService` if you can. This
 * allows web embedders to override our defaults. But for things like `product.quality`,
 * the use is fine because that property is not overridable.
 */
let product: IProductConfiguration;

// Native sandbox environment
const vscodeGlobal = (globalThis as any).vscode;
if (typeof vscodeGlobal !== 'undefined' && typeof vscodeGlobal.context !== 'undefined') {
	const configuration: ISandboxConfiguration | undefined = vscodeGlobal.context.configuration();
	if (configuration) {
		product = configuration.product;
	} else {
		throw new Error('Sandbox: unable to resolve product configuration from preload script.');
	}
}
// _VSCODE environment
else if (globalThis._VSCODE_PRODUCT_JSON && globalThis._VSCODE_PACKAGE_JSON) {
	// Obtain values from product.json and package.json-data
	product = globalThis._VSCODE_PRODUCT_JSON as unknown as IProductConfiguration;

	// Running out of sources
	if (env['VSCODE_DEV']) {
		Object.assign(product, {
			nameShort: `${product.nameShort} Dev`,
			nameLong: `${product.nameLong} Dev`,
			dataFolderName: `${product.dataFolderName}-dev`,
			serverDataFolderName: product.serverDataFolderName ? `${product.serverDataFolderName}-dev` : undefined
		});
	}

	// Version is added during built time, but we still
	// want to have it running out of sources so we
	// read it from package.json only when we need it.
	if (!product.version) {
		const pkg = globalThis._VSCODE_PACKAGE_JSON as { version: string };

		Object.assign(product, {
			version: pkg.version
		});
	}
}

// Web environment or unknown
else {

	// Built time configuration (do NOT modify)
	product = { /*BUILD->INSERT_PRODUCT_CONFIGURATION*/ } as any;
	product = loadFromFileSystem();

	// Running out of sources
	if (Object.keys(product).length === 0) {
		Object.assign(product, {
			version: '1.102.0-dev',
			nameShort: 'Code - OSS Dev',
			nameLong: 'Code - OSS Dev',
			applicationName: 'code-oss',
			dataFolderName: '.vscode-oss',
			urlProtocol: 'code-oss',
			reportIssueUrl: 'https://github.com/microsoft/vscode/issues/new',
			licenseName: 'MIT',
			licenseUrl: 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt',
			serverLicenseUrl: 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt',
			extensionsGallery: {
				serviceUrl: 'https://open-vsx.org/vscode/gallery',
				itemUrl: 'https://open-vsx.org/vscode/item',
			},
			defaultChatAgent: {
				'extensionId': 'GitHub.copilot',
				'chatExtensionId': 'GitHub.copilot-chat',
				'documentationUrl': 'https://aka.ms/github-copilot-overview',
				'termsStatementUrl': 'https://aka.ms/github-copilot-terms-statement',
				'privacyStatementUrl': 'https://aka.ms/github-copilot-privacy-statement',
				'skusDocumentationUrl': 'https://aka.ms/github-copilot-plans',
				'publicCodeMatchesUrl': 'https://aka.ms/github-copilot-match-public-code',
				'manageSettingsUrl': 'https://aka.ms/github-copilot-settings',
				'managePlanUrl': 'https://aka.ms/github-copilot-manage-plan',
				'manageOverageUrl': 'https://aka.ms/github-copilot-manage-overage',
				'upgradePlanUrl': 'https://aka.ms/github-copilot-upgrade-plan',
				'signUpUrl': 'https://aka.ms/github-sign-up',
				'provider': {
					'default': {
						'id': 'github',
						'name': 'GitHub'
					},
					'enterprise': {
						'id': 'github-enterprise',
						'name': 'GHE.com'
					},
					'google': {
						'id': 'google',
						'name': 'Google'
					},
					'apple': {
						'id': 'apple',
						'name': 'Apple'
					}
				},
				'providerUriSetting': 'github-enterprise.uri',
				'providerScopes': [
					[
						'user:email'
					],
					[
						'read:user'
					],
					[
						'read:user',
						'user:email',
						'repo',
						'workflow'
					]
				],
				'entitlementUrl': 'https://api.github.com/copilot_internal/user',
				'entitlementSignupLimitedUrl': 'https://api.github.com/copilot_internal/subscribe_limited_user',
				'chatQuotaExceededContext': 'github.copilot.chat.quotaExceeded',
				'completionsQuotaExceededContext': 'github.copilot.completions.quotaExceeded',
				'walkthroughCommand': 'github.copilot.open.walkthrough',
				'completionsMenuCommand': 'github.copilot.toggleStatusMenu',
				'completionsRefreshTokenCommand': 'github.copilot.signIn',
				'chatRefreshTokenCommand': 'github.copilot.refreshToken',
				'completionsAdvancedSetting': 'github.copilot.advanced',
				'completionsEnablementSetting': 'github.copilot.enable',
				'nextEditSuggestionsSetting': 'github.copilot.nextEditSuggestions.enabled'
			},
			trustedExtensionAuthAccess: {
				'github': [
					'github.copilot-chat'
				]
			}
		});
	}
}

export default product;
