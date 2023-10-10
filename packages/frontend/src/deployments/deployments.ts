import { env } from '@/components/config/environment'
import { SubstrateDeployment } from '@scio-labs/use-inkathon'

export enum ContractIds {
  Greeter = 'greeter',
  Polkalance = 'polkalance',
}

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  const networks = env.supportedChains
  const deployments = networks
    .map(async (network) => [
      {
        contractId: ContractIds.Polkalance,
        networkId: network,
        abi: await import(`../../../contracts/deployments/polkalance/metadata.json`),
        address: (await import(`../../../contracts/deployments/polkalance/${network}.ts`)).address,
      },
    ])
    .reduce(async (acc, curr) => [...(await acc), ...(await curr)], [] as any)

  return deployments
}
