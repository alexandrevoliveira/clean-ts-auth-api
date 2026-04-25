import { LoadUserProfile, SaveUserPicture } from '@/domain/contracts/repos'
import { PgRepository } from '@/infra/repos/postgres'
import { PgUser } from '@/infra/repos/postgres/entities'

export class PgUserProfileRepository extends PgRepository implements SaveUserPicture, LoadUserProfile {
  async savePicture ({ id, pictureUrl, initials }: SaveUserPicture.Input): Promise<void> {
    const pgUserRepo = this.getRepository(PgUser)
    await pgUserRepo.update({ id: parseInt(id) }, { pictureUrl: pictureUrl ?? null, initials: initials ?? null } as any)
  }

  async load ({ id }: LoadUserProfile.Input): Promise<LoadUserProfile.Output> {
    const pgUserRepo = this.getRepository(PgUser)
    const pgUser = await pgUserRepo.findOne({ where: { id: parseInt(id) } })
    if (pgUser !== null) return { name: pgUser.name ?? undefined }
  }
}
