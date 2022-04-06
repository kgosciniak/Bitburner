function getStaminaPercentage(ns) {
  const res = ns.bladeburner.getStamina();
  return res[0] / res[1];
}

function canWork(ns) {
  return getStaminaPercentage(ns) > 0.5;
}

function shouldTrain(ns) {
  const res = ns.bladeburner.getStamina();
  return res[1] < 400;
}

function rest(ns) {
  const res = ns.bladeburner.getStamina();
  if (shouldTrain(ns)) {
    ns.bladeburner.startAction("general", "Training");
    return ns.bladeburner.getActionTime("general", "Training");
  }
  ns.bladeburner.startAction("general", "Hyperbolic Regeneration Chamber");
  return ns.bladeburner.getActionTime("general", "Hyperbolic Regeneration Chamber");
}

const getChance = (type, name, ns) =>
  ns.bladeburner.getActionEstimatedSuccessChance(type, name);

function work(ns) {
  const contracts = ns.bladeburner.getContractNames();
  const operations = ns.bladeburner.getOperationNames();

  const bestContract = contracts
    .map(contract => {
      return {
        type: "contract",
        name: contract,
        chance: getChance("contract", contract, ns)
      };
    })
    .reduce((a, b) => (a.chance > b.chance ? a : b));

  const bestOp = operations
    .map(operation => {
      return {
        type: "operation",
        name: operation,
        chance: getChance("operation", operation, ns)
      };
    })
    .reduce((a, b) => (a.chance > b.chance ? a : b));

  if (bestOp.chance >= bestContract.chance) {
    //ns.bladeburner.setTeamSize(bestOp.type, bestOp.name, 100);
    if (ns.bladeburner.getActionCountRemaining(bestOp.type, bestOp.name) < 1) {
      ns.bladeburner.startAction("general", "Incite Violence");
      return ns.bladeburner.getActionTime("general", "Incite Violence");
    }
    ns.bladeburner.startAction(bestOp.type, bestOp.name);
    return ns.bladeburner.getActionTime(bestOp.type, bestOp.name);
  }
  if (ns.bladeburner.getActionCountRemaining(bestContract.type, bestContract.name) < 1) {
    ns.bladeburner.startAction("general", "Incite Violence");
    return ns.bladeburner.getActionTime("general", "Incite Violence");
  }
  ns.bladeburner.startAction(bestContract.type, bestContract.name);
  return ns.bladeburner.getActionTime(bestContract.type, bestContract.name);
}

function checkSkills(ns) {
  const skills = ns.bladeburner.getSkillNames().map(skill => {
    return {
      name: skill,
      level: ns.bladeburner.getSkillLevel(skill),
      cost: ns.bladeburner.getSkillUpgradeCost(skill)
    };
  });
  skills.forEach(skill => {
    if (skill.cost < ns.bladeburner.getSkillPoints())
      ns.bladeburner.upgradeSkill(skill.name);
  });
}

export async function main(ns) {
  ns.atExit(() => { ns.bladeburner.stopBladeburnerAction() });
  // while combat stats are less then 100 don't join bladeburner
  while (ns.getPlayer().strength < 100 && ns.getPlayer().defense < 100 && ns.getPlayer().dexterity < 100 && ns.getPlayer().agility < 100) {
    await ns.sleep(30000);
  }
  ns.bladeburner.joinBladeburnerDivision();
  // Set max autolevel of everything.
  const contracts = ns.bladeburner.getContractNames();
  const operations = ns.bladeburner.getOperationNames();
  // Set contracts and operations to auto level
  contracts.forEach(contract =>
    ns.bladeburner.setActionAutolevel("contract", contract, true)
  );
  operations.forEach(operation =>
    ns.bladeburner.setActionAutolevel("operation", operation, true)
  );
  // main loop
  while (true) {
    // hospitalize if not at full HP
    while (ns.getPlayer().hp < ns.getPlayer().max_hp) {
      ns.hospitalize();
      await ns.sleep(100);
    }
    // keep Chaos below 100
    while (ns.bladeburner.getCityChaos(ns.bladeburner.getCity()) >= 100) {
      ns.bladeburner.startAction("general", "Diplomacy");
      await ns.sleep(ns.bladeburner.getActionTime("general", "Diplomacy"));
    }
    // perform Field Analysis if estimate range exist
    while (ns.bladeburner.getActionEstimatedSuccessChance("operation", "Assassination")[0] != ns.bladeburner.getActionEstimatedSuccessChance("operation", "Assassination")[1]) {
      ns.bladeburner.startAction("general", "Field Analysis");
      await ns.sleep(ns.bladeburner.getActionTime("general", "Field Analysis"));
    }
    const sleepTime = (canWork(ns) ? work(ns) : rest(ns));
    await ns.sleep(sleepTime);
    //checkSkills(ns);
  }
}
