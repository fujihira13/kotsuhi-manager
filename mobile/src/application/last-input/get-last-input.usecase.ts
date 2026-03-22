import { LastInput, LastInputRepository } from './last-input'

export class GetLastInputUseCase {
  constructor(private readonly lastInputRepository: LastInputRepository) {}

  async execute(): Promise<LastInput> {
    return this.lastInputRepository.get()
  }
}
