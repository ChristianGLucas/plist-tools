import { PlistValue, UsageDescription, InfoPlistSummaryRequest, InfoPlistSummaryResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError } from './helpers';

const T = PlistValue.PlistType;

function stringField(dict: PlistValue, key: string): string {
  const match = dict.getDictValueList().find((e) => e.getKey() === key);
  const v = match?.getValue();
  return v && v.getType() === T.STRING ? v.getStringValue() : '';
}

/**
 * Extract the common Info.plist fields, when present, from a parsed
 * PlistValue tree: CFBundleIdentifier, CFBundleVersion,
 * CFBundleShortVersionString, CFBundleName, CFBundleDisplayName, every URL
 * scheme declared across CFBundleURLTypes, and every recognized
 * permission-usage-description key (NS*UsageDescription). `root` must be
 * a DICT (as every real Info.plist is); a value the wrong plist type for
 * its documented field (e.g. CFBundleIdentifier not a string) is treated
 * as absent rather than erroring, since this node reports what a caller
 * can safely use, not a schema validator.
 */
export function getInfoPlistSummary(ax: AxiomContext, input: InfoPlistSummaryRequest): InfoPlistSummaryResult {
  const result = new InfoPlistSummaryResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  if (root.getType() !== T.DICT) {
    result.setError(mkError('NOT_A_DICT', 'root is not a DICT'));
    return result;
  }

  const bundleIdentifier = stringField(root, 'CFBundleIdentifier');
  const bundleVersion = stringField(root, 'CFBundleVersion');
  const bundleShortVersionString = stringField(root, 'CFBundleShortVersionString');
  const bundleName = stringField(root, 'CFBundleName');
  const bundleDisplayName = stringField(root, 'CFBundleDisplayName');

  const urlSchemes: string[] = [];
  const urlTypesEntry = root.getDictValueList().find((e) => e.getKey() === 'CFBundleURLTypes');
  const urlTypesValue = urlTypesEntry?.getValue();
  if (urlTypesValue && urlTypesValue.getType() === T.ARRAY) {
    for (const item of urlTypesValue.getArrayValueList()) {
      if (item.getType() !== T.DICT) continue;
      const schemesEntry = item.getDictValueList().find((e) => e.getKey() === 'CFBundleURLSchemes');
      const schemesValue = schemesEntry?.getValue();
      if (schemesValue && schemesValue.getType() === T.ARRAY) {
        for (const s of schemesValue.getArrayValueList()) {
          if (s.getType() === T.STRING) urlSchemes.push(s.getStringValue());
        }
      }
    }
  }

  const usageDescriptions: UsageDescription[] = [];
  for (const entry of root.getDictValueList()) {
    const key = entry.getKey();
    if (key.startsWith('NS') && key.endsWith('UsageDescription')) {
      const v = entry.getValue();
      if (v && v.getType() === T.STRING) {
        const ud = new UsageDescription();
        ud.setKey(key);
        ud.setDescription(v.getStringValue());
        usageDescriptions.push(ud);
      }
    }
  }

  result.setBundleIdentifier(bundleIdentifier);
  result.setBundleVersion(bundleVersion);
  result.setBundleShortVersionString(bundleShortVersionString);
  result.setBundleName(bundleName);
  result.setBundleDisplayName(bundleDisplayName);
  result.setUrlSchemesList(urlSchemes);
  result.setUsageDescriptionsList(usageDescriptions);
  result.setRecognizedFieldsFound(
    !!(bundleIdentifier || bundleVersion || bundleShortVersionString || bundleName || bundleDisplayName || urlSchemes.length || usageDescriptions.length),
  );
  return result;
}
