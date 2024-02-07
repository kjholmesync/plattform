const { handleReferral } = require('../../lib/referralHandler')

jest.mock('pogi')

describe('test referral handling', () => {
  test('pledge.payload is undefined', () => {
    const context = {
      pgdb: jest.fn(() => {}),
      mail: jest.fn(() => {}),
      t: jest.fn(() => {}),
    }
    const pledge = { hello: '123' }
    expect(handleReferral(pledge, context)).resolves.toBeUndefined()
    expect(context.pgdb).not.toBeCalled()
  })
  test('referral_code is not defined', () => {
    const context = {
      pgdb: jest.fn(() => {}),
      mail: jest.fn(() => {}),
      t: jest.fn(() => {}),
    }
    const pledge = {
      payload: { referral_code: undefined, referral_campaign: '0000-0001' },
    }
    expect(handleReferral(pledge, context)).resolves.toBeUndefined()
    expect(context.pgdb).not.toBeCalled()
  })
  test('ref_camapign is not defined', () => {
    const context = {
      pgdb: jest.fn(() => {}),
      mail: jest.fn(() => {}),
      t: jest.fn(() => {}),
    }
    const pledge = {
      payload: { referral_code: '1111-0001', referral_campaign: undefined },
    }
    expect(handleReferral(pledge, context)).resolves.toBeUndefined()
    expect(context.pgdb).not.toBeCalled()
  })
  test('referral_code is invalid', () => {
    const referralCode = '1234'
    const context = {
      pgdb: {
        public: {
          users: { findOne: jest.fn(() => {}) },
          campaigns: { findOne: jest.fn(() => {}) },
        },
      },
      mail: jest.fn(() => {}),
      t: jest.fn(() => {}),
    }
    const pledge = {
      payload: { referral_code: referralCode, referral_campaign: '0000-0001' },
    }
    expect(handleReferral(pledge, context)).rejects.toThrowError(
      'referrer not found',
    )
    expect(context.pgdb.public.users.findOne).toBeCalledTimes(1)
  })
  test('referral_code is valid and returns user, campaign is invalid', () => {
    const referrerId = 'abcd-1234'
    const context = {
      pgdb: {
        public: {
          users: {
            findOne: jest.fn(() => ({
              id: referrerId,
            })),
          },
          campaigns: { findOne: jest.fn(() => {}) },
        },
      },
      mail: jest.fn(() => {}),
      t: jest.fn(() => {}),
    }
    const pledge = {
      payload: { referral_code: '1234-5678', referral_campaign: '0000-0001' },
    }
    expect(handleReferral(pledge, context)).rejects.toThrowError(
      'campaign not found',
    )
    expect(context.pgdb.public.users.findOne).toBeCalledTimes(1)
  })
  test('campaign is not active, in the past', () => {
    const pastCampaign = { beginDate: '2023-01-01', endDate: '2023-03-01' }
    const futureCampaign = { beginDate: '3023-01-01', endDate: '3023-02-01' }
    const referrerId = 'abcd-1234'
    const context = {
      pgdb: {
        public: {
          users: {
            findOne: jest.fn(() => ({
              id: referrerId,
            })),
          },
          campaigns: {
            findOne: jest.fn(({ id }) => {
              return {
                '0000-0001': pastCampaign,
                '0000-0002': futureCampaign,
              }[id]
            }),
          },
        },
      },
      mail: jest.fn(() => {}),
      t: jest.fn(() => {}),
    }
    const pledge1 = {
      payload: { referral_code: '1234-5678', referral_campaign: '0000-0001' },
    }
    expect(handleReferral(pledge1, context)).rejects.toThrowError(
      'campaign is not active',
    )
    const pledge2 = {
      payload: { referral_code: '1234-5678', referral_campaign: '0000-0002' },
    }
    expect(handleReferral(pledge2, context)).rejects.toThrowError(
      'campaign is not active',
    )
  })
})
