import prisma from "../config/prisma";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
}

export const createUser = async (data: {
  name: string,
  email: string,
  password: string;
}) => {
  return prisma.user.create({
    data: {
      ...data,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  })
}


// Store hashed refresh token
export const createRefreshToken = async (data: {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}) => {
  return prisma.refreshToken.create({
    data,
  });
};

export const findRefreshToken = async (tokenHash: string) => {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
  });
};

// Atomically revoke an existing token and create its replacement
export const rotateRefreshToken = async (params: { tokenId: string, userId: string, newTokenHash: string, expiresAt: Date }) => {

  return prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({
      where: {
        id: params.tokenId,
        userId: params.userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        revokedAt: new Date(),
      }
    })

    if (revoked.count !== 1) {
      return false;
    }

    await tx.refreshToken.create({
      data: {
        tokenHash: params.newTokenHash,
        userId: params.userId,
        expiresAt: params.expiresAt,
      }
    })

    return true;
  })
}

// Revoke all active refresh tokens belonging to a user
export const revokeAllRefreshTokens = async (userId: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

// Revoke one active refresh token
export const revokeRefreshToken = async (tokenHash: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const updateUserProfile = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

export const updateUserPasswordAndRevokeSessions = async (
  userId: string,
  password: string
) => {
  const revokedAt = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { password },
      select: { id: true },
    }),
    prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt },
    }),
  ]);
};

export const revokeRefreshTokenForUser = async (
  tokenHash: string,
  userId: string
) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date()
    }
  })
}

export const findUserAuthStatusById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });
};