// Fetch portfolio data for multiple chains and aggregate the results
// @ts-nocheck
import { getPortfolio } from './api-methods';

export async function getAggregatedPortfolio(address: string | undefined, chainIds: number[]) {
  if (!address || !chainIds || chainIds.length === 0) return;
  const results = await Promise.all(
    chainIds.map(chainId => getPortfolio(address, chainId))
  );

  // Filter out any undefined/null responses
  const validResults = results.filter(Boolean);

  // Aggregate totals
  const aggregated = {
    total: 0,
    by_address: [],
    by_category: {},
    by_protocol_group: {},
    by_chain: [],
    by_token: {}, // <-- Added
  };

  validResults.forEach((res: any) => {
    const result = res.result;
    aggregated.total += result.total;

    // by_address
    result.by_address.forEach((addr: any) => {
      aggregated.by_address.push(addr);
    });

    // by_category
    result.by_category.forEach((cat: any) => {
      if (!aggregated.by_category[cat.category_id]) {
        aggregated.by_category[cat.category_id] = {
          value_usd: 0,
          category_id: cat.category_id,
          category_name: cat.category_name,
        };
      }
      aggregated.by_category[cat.category_id].value_usd += cat.value_usd;
    });

    // by_protocol_group
    result.by_protocol_group.forEach((pg: any) => {
      if (!aggregated.by_protocol_group[pg.protocol_group_id]) {
        aggregated.by_protocol_group[pg.protocol_group_id] = {
          value_usd: 0,
          protocol_group_id: pg.protocol_group_id,
          protocol_group_name: pg.protocol_group_name,
        };
      }
      aggregated.by_protocol_group[pg.protocol_group_id].value_usd += pg.value_usd;
    });

    // by_chain
    result.by_chain.forEach((chain: any) => {
      aggregated.by_chain.push(chain);
    });

    // by_token (NEW)
    // If your API response includes a list of tokens and their balances, aggregate here.
    // Example: result.tokens = [{symbol: 'ETH', value_usd: 10, ...}, ...]
    if (result.tokens && Array.isArray(result.tokens)) {
      result.tokens.forEach((token: any) => {
        if (!aggregated.by_token[token.symbol]) {
          aggregated.by_token[token.symbol] = {
            value_usd: 0,
            symbol: token.symbol,
            name: token.name || token.symbol,
            address: token.address,
          };
        }
        aggregated.by_token[token.symbol].value_usd += token.value_usd;
      });
    }
  });

  // Convert by_category, by_protocol_group, by_token to arrays
  aggregated.by_category = Object.values(aggregated.by_category);
  aggregated.by_protocol_group = Object.values(aggregated.by_protocol_group);
  aggregated.by_token = Object.values(aggregated.by_token);

  return aggregated;
}

