import { env } from '@/components/config/environment'
import { SubstrateDeployment } from '@scio-labs/use-inkathon'

export enum ContractIds {
  Greeter = 'greeter',
  Freelankakot = 'freelankakot',
}

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  const networks = env.supportedChains
  const deployments = networks
    .map(async (network) => [
      {
        contractId: ContractIds.Freelankakot,
        networkId: network,
        abi: await import(`../../../contracts/deployments/freelankakot/metadata.json`),
        address: (await import(`../../../contracts/deployments/freelankakot/${network}.ts`)).address,
      },
    ])
    .reduce(async (acc, curr) => [...(await acc), ...(await curr)], [] as any)

  return deployments
}
