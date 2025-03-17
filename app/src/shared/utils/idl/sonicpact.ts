export const IDL = {
  "address": "GrujK4NkA76V7BvkS66t1gAPXJKJgmF6dXoRGiq7CeoM",
  "metadata": {
    "name": "sonicpact",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "accept_deal",
      "discriminator": [
        76,
        156,
        34,
        30,
        129,
        136,
        76,
        244
      ],
      "accounts": [
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "cancel_deal",
      "discriminator": [
        158,
        86,
        193,
        45,
        168,
        111,
        48,
        29
      ],
      "accounts": [
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "studio",
          "writable": true
        },
        {
          "name": "deal_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "deal"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "complete_deal",
      "discriminator": [
        121,
        16,
        6,
        239,
        208,
        68,
        140,
        61
      ],
      "accounts": [
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "studio",
          "writable": true
        },
        {
          "name": "celebrity",
          "writable": true
        },
        {
          "name": "deal_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "deal"
              }
            ]
          }
        },
        {
          "name": "platform"
        },
        {
          "name": "platform_authority",
          "writable": true
        },
        {
          "name": "nft_mint",
          "docs": [
            "NFT mint account"
          ],
          "writable": true
        },
        {
          "name": "nft_mint_authority",
          "docs": [
            "NFT mint authority (PDA)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "deal"
              }
            ]
          }
        },
        {
          "name": "studio_token_account",
          "docs": [
            "Studio token account to receive the NFT"
          ],
          "writable": true
        },
        {
          "name": "nft_metadata",
          "docs": [
            "NFT metadata account"
          ],
          "writable": true
        },
        {
          "name": "token_program",
          "docs": [
            "SPL token program"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "metadata_program",
          "docs": [
            "Metadata program"
          ]
        },
        {
          "name": "associated_token_program",
          "docs": [
            "Associated token program"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "create_deal",
      "discriminator": [
        198,
        212,
        144,
        151,
        97,
        56,
        149,
        113
      ],
      "accounts": [
        {
          "name": "deal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "platform"
              },
              {
                "kind": "account",
                "path": "platform.total_deals",
                "account": "Platform"
              }
            ]
          }
        },
        {
          "name": "platform",
          "writable": true
        },
        {
          "name": "studio",
          "writable": true,
          "signer": true
        },
        {
          "name": "celebrity"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "deal_terms",
          "type": {
            "defined": {
              "name": "DealTerms"
            }
          }
        },
        {
          "name": "deal_name",
          "type": "string"
        },
        {
          "name": "deal_description",
          "type": "string"
        }
      ]
    },
    {
      "name": "fund_deal",
      "discriminator": [
        8,
        26,
        74,
        169,
        132,
        56,
        104,
        60
      ],
      "accounts": [
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "studio",
          "writable": true,
          "signer": true
        },
        {
          "name": "deal_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "deal"
              }
            ]
          }
        },
        {
          "name": "platform"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize_platform",
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "platform_fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "update_platform_fee",
      "discriminator": [
        162,
        97,
        186,
        47,
        93,
        113,
        176,
        243
      ],
      "accounts": [
        {
          "name": "platform",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "new_fee",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Deal",
      "discriminator": [
        125,
        223,
        160,
        234,
        71,
        162,
        182,
        219
      ]
    },
    {
      "name": "Platform",
      "discriminator": [
        77,
        92,
        204,
        58,
        187,
        98,
        91,
        12
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6001,
      "name": "InvalidDealStatus",
      "msg": "Invalid deal status for this operation"
    },
    {
      "code": 6002,
      "name": "FeeTooHigh",
      "msg": "Platform fee too high (max 10%)"
    }
  ],
  "types": [
    {
      "name": "Deal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "studio",
            "type": "pubkey"
          },
          {
            "name": "celebrity",
            "type": "pubkey"
          },
          {
            "name": "platform",
            "type": "pubkey"
          },
          {
            "name": "terms",
            "type": {
              "defined": {
                "name": "DealTerms"
              }
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "DealStatus"
              }
            }
          },
          {
            "name": "created_at",
            "type": "i64"
          },
          {
            "name": "updated_at",
            "type": "i64"
          },
          {
            "name": "funded_amount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "DealStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Proposed"
          },
          {
            "name": "Accepted"
          },
          {
            "name": "Funded"
          },
          {
            "name": "Completed"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    },
    {
      "name": "DealTerms",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payment_amount",
            "type": "u64"
          },
          {
            "name": "duration_days",
            "type": "u16"
          },
          {
            "name": "usage_rights",
            "type": {
              "defined": {
                "name": "UsageRights"
              }
            }
          },
          {
            "name": "exclusivity",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Platform",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "platform_fee",
            "type": "u64"
          },
          {
            "name": "total_deals",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UsageRights",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Limited"
          },
          {
            "name": "Full"
          },
          {
            "name": "Custom"
          }
        ]
      }
    }
  ]
};