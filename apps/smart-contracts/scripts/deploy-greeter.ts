import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const name = 'Greeter';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const deployment = await deploy(name, {
    from: deployer,
    args: ['Hello, Hardhat'],
  });

  deployments.log(`Contract ${name} deployed at ${deployment.address}`);
};

export default func;

func.tags = [name];
func.dependencies = ['RoyaltyStreams', 'Treasury'];
