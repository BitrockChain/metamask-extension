import { useContext, useEffect, useRef } from 'react';
import { Hex } from '@metamask/utils';

import {
  MetaMetricsEventCategory,
  MetaMetricsEventLocation,
  MetaMetricsEventName,
  MetaMetricsEventUiCustomization,
} from '../../../../shared/constants/metametrics';
import { TokenStandard } from '../../../../shared/constants/transaction';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { parseTokenDetailDecimals, TokenDetailsERC20 } from '../utils/token';

/**
 * Track event that number of decimals in ERC20 is not obtained
 *
 * @param chainId
 * @param tokenAddress
 * @param tokenDetails
 * @param metricLocation
 */
const useTrackERC20WithoutDecimalInformation = (
  chainId: Hex,
  tokenAddress: Hex | string | undefined,
  tokenDetails?: TokenDetailsERC20,
  metricLocation = MetaMetricsEventLocation.SignatureConfirmation,
) => {
  const trackEvent = useContext(MetaMetricsContext);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (
      chainId === undefined ||
      tokenDetails === undefined ||
      hasTracked.current
    ) {
      return;
    }

    const { decimals, standard } = tokenDetails || {};
    if (standard !== TokenStandard.ERC20) {
      return;
    }

    const parsedDecimals = parseTokenDetailDecimals(decimals);
    if (parsedDecimals === undefined) {
      trackEvent({
        event: MetaMetricsEventName.SimulationIncompleteAssetDisplayed,
        category: MetaMetricsEventCategory.Confirmations,
        properties: {
          token_decimals_available: 'not_available',
          asset_address: tokenAddress,
          asset_type: TokenStandard.ERC20,
          chain_id: chainId,
          location: metricLocation,
          ui_customizations: [
            MetaMetricsEventUiCustomization.RedesignedConfirmation,
          ],
        },
      });
      hasTracked.current = true;
    }
  }, [tokenDetails, chainId, metricLocation, tokenAddress, trackEvent]);
};

export default useTrackERC20WithoutDecimalInformation;
