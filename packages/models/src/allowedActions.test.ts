import { EActions, EResource } from "./permissions";
import {
  defaultAdminHandlingForResource,
  isActionOnResource,
  allowAdminAll,
  allowAdminOnResource,
  forIdentifier,
} from "./allowedActions";
import { and, oneOf, or } from "./matcher";

describe("#allowedActions", () => {
  it("#defaultAdminHandlingForResource boring", () => {
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET],
        EResource.FAUCET
      )({
        action: EActions.GET,
        resource: EResource.FAUCET,
      })
    ).toBe(true);
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET],
        EResource.FAUCET
      )({
        action: EActions.LIST,
        resource: EResource.FAUCET,
      })
    ).toBe(false);
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET],
        EResource.FAUCET
      )({
        action: EActions.GET,
        resource: EResource.PRESALE,
      })
    ).toBe(false);
  });
  it("#defaultAdminHandlingForResource allows admin", () => {
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET],
        EResource.FAUCET
      )({
        action: EActions.ADMIN,
        resource: EResource.FAUCET,
      })
    ).toBe(true);

    expect(
      defaultAdminHandlingForResource(
        [EActions.GET],
        EResource.FAUCET
      )({
        action: EActions.ADMIN,
        resource: EResource.PERMISSION,
      })
    ).toBe(false);
  });
  it("#defaultAdminHandlingForResource allows admin on all", () => {
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET],
        EResource.FAUCET
      )({
        action: EActions.ADMIN,
        resource: EResource.ALL,
      })
    ).toBe(true);
  });
  it("#defaultAdminHandlingForResource multiple actions", () => {
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET, EActions.LIST],
        EResource.FAUCET
      )({
        action: EActions.LIST,
        resource: EResource.FAUCET,
      })
    ).toBe(true);
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET, EActions.LIST],
        EResource.FAUCET
      )({
        action: EActions.GET,
        resource: EResource.FAUCET,
      })
    ).toBe(true);
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET, EActions.LIST],
        EResource.FAUCET
      )({
        action: EActions.LIST,
        resource: EResource.PERMISSION,
      })
    ).toBe(false);
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET, EActions.LIST],
        EResource.FAUCET
      )({
        action: EActions.GET,
        resource: EResource.PRESALE,
      })
    ).toBe(false);
    expect(
      defaultAdminHandlingForResource(
        [EActions.GET, EActions.LIST],
        EResource.FAUCET
      )({
        action: EActions.DELETE,
        resource: EResource.FAUCET,
      })
    ).toBe(false);
  });
  it("#defaultAdminHandlingForResource identifiers narrow scope", () => {
    expect(
      forIdentifier(
        "self",
        defaultAdminHandlingForResource(
          [EActions.GET, EActions.LIST],
          EResource.FAUCET
        )
      )({
        action: EActions.LIST,
        resource: EResource.FAUCET,
        identifier: "self",
      })
    ).toBe(true);
    expect(
      forIdentifier(
        "self",
        defaultAdminHandlingForResource(
          [EActions.GET, EActions.LIST],
          EResource.FAUCET
        )
      )({
        action: EActions.GET,
        resource: EResource.FAUCET,
        identifier: "self",
      })
    ).toBe(true);
    expect(
      forIdentifier(
        "self",
        defaultAdminHandlingForResource(
          [EActions.GET, EActions.LIST],
          EResource.FAUCET
        )
      )({
        action: EActions.GET,
        resource: EResource.FAUCET,
      })
    ).toBe(false);
  });
  it("identity scoped permissions can not be used for unscoped requests", () => {
    expect(
      isActionOnResource({
        action: EActions.GET,
        resource: EResource.FAUCET,
        identifier: "self",
      })({
        action: EActions.GET,
        resource: EResource.FAUCET,
      })
    ).toBe(false);
  });
  it("#allowAdminOnResource", () => {
    const allowAdminOnFaucet = allowAdminOnResource(EResource.FAUCET);
    expect(
      allowAdminOnFaucet({
        action: EActions.ADMIN,
        resource: EResource.FAUCET,
      })
    ).toBe(true);
    expect(
      allowAdminOnFaucet({
        action: EActions.ADMIN,
        resource: EResource.FAUCET,
        identifier: "self",
      })
    ).toBe(false);
  });
  it("#defaultAdminHandlingForResource fancy", () => {
    const fancy = oneOf(
      or(
        allowAdminAll,
        allowAdminOnResource(EResource.ROLE),
        allowAdminOnResource(EResource.USER_ROLE),
        allowAdminOnResource(EResource.PERMISSION),
        isActionOnResource({
          action: EActions.DELETE,
          resource: EResource.USER,
        })
      )
    );
    expect(
      fancy([
        {
          action: EActions.DELETE,
          resource: EResource.USER,
        },
      ])
    ).toBe(true);
    expect(
      fancy([
        {
          action: EActions.ADMIN,
          resource: EResource.USER,
        },
      ])
    ).toBe(false);
    expect(
      fancy([
        {
          action: EActions.ADMIN,
          resource: EResource.ALL,
        },
      ])
    ).toBe(true);
    expect(
      fancy([
        {
          action: EActions.DELETE,
          resource: EResource.ROLE,
        },
      ])
    ).toBe(false);
    expect(
      fancy([
        {
          action: EActions.ADMIN,
          resource: EResource.ROLE,
        },
      ])
    ).toBe(true);
    expect(
      fancy([
        {
          action: EActions.ADMIN,
          resource: EResource.USER,
        },
        {
          action: EActions.DELETE,
          resource: EResource.ROLE,
        },
      ])
    ).toBe(false);
  });
});
