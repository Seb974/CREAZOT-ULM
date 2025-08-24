<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250824150812 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE aeronef ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD created_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD updated_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD CONSTRAINT FK_F6D1EF99B03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE aeronef ADD CONSTRAINT FK_F6D1EF99896DBBDE FOREIGN KEY (updated_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_F6D1EF99B03A8386 ON aeronef (created_by_id)');
        $this->addSql('CREATE INDEX IDX_F6D1EF99896DBBDE ON aeronef (updated_by_id)');
        $this->addSql('ALTER TABLE certificat_medical ADD created_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE certificat_medical ADD updated_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE certificat_medical ADD CONSTRAINT FK_3C705FDBB03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE certificat_medical ADD CONSTRAINT FK_3C705FDB896DBBDE FOREIGN KEY (updated_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_3C705FDBB03A8386 ON certificat_medical (created_by_id)');
        $this->addSql('CREATE INDEX IDX_3C705FDB896DBBDE ON certificat_medical (updated_by_id)');
        $this->addSql('ALTER TABLE entretien ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE entretien ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE entretien ADD created_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE entretien ADD updated_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE entretien ADD CONSTRAINT FK_2B58D6DAB03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE entretien ADD CONSTRAINT FK_2B58D6DA896DBBDE FOREIGN KEY (updated_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_2B58D6DAB03A8386 ON entretien (created_by_id)');
        $this->addSql('CREATE INDEX IDX_2B58D6DA896DBBDE ON entretien (updated_by_id)');
        $this->addSql('ALTER TABLE pilot_qualification ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE pilot_qualification ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE pilot_qualification ADD created_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE pilot_qualification ADD updated_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE pilot_qualification ADD CONSTRAINT FK_A9811BEEB03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE pilot_qualification ADD CONSTRAINT FK_A9811BEE896DBBDE FOREIGN KEY (updated_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_A9811BEEB03A8386 ON pilot_qualification (created_by_id)');
        $this->addSql('CREATE INDEX IDX_A9811BEE896DBBDE ON pilot_qualification (updated_by_id)');
        $this->addSql('ALTER TABLE profil_pilote ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE profil_pilote ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE profil_pilote ADD created_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE profil_pilote ADD updated_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE profil_pilote ADD CONSTRAINT FK_1BCDDD8FB03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE profil_pilote ADD CONSTRAINT FK_1BCDDD8F896DBBDE FOREIGN KEY (updated_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1BCDDD8FB03A8386 ON profil_pilote (created_by_id)');
        $this->addSql('CREATE INDEX IDX_1BCDDD8F896DBBDE ON profil_pilote (updated_by_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE profil_pilote DROP CONSTRAINT FK_1BCDDD8FB03A8386');
        $this->addSql('ALTER TABLE profil_pilote DROP CONSTRAINT FK_1BCDDD8F896DBBDE');
        $this->addSql('DROP INDEX IDX_1BCDDD8FB03A8386');
        $this->addSql('DROP INDEX IDX_1BCDDD8F896DBBDE');
        $this->addSql('ALTER TABLE profil_pilote DROP created_at');
        $this->addSql('ALTER TABLE profil_pilote DROP updated_at');
        $this->addSql('ALTER TABLE profil_pilote DROP created_by_id');
        $this->addSql('ALTER TABLE profil_pilote DROP updated_by_id');
        $this->addSql('ALTER TABLE aeronef DROP CONSTRAINT FK_F6D1EF99B03A8386');
        $this->addSql('ALTER TABLE aeronef DROP CONSTRAINT FK_F6D1EF99896DBBDE');
        $this->addSql('DROP INDEX IDX_F6D1EF99B03A8386');
        $this->addSql('DROP INDEX IDX_F6D1EF99896DBBDE');
        $this->addSql('ALTER TABLE aeronef DROP created_at');
        $this->addSql('ALTER TABLE aeronef DROP updated_at');
        $this->addSql('ALTER TABLE aeronef DROP created_by_id');
        $this->addSql('ALTER TABLE aeronef DROP updated_by_id');
        $this->addSql('ALTER TABLE certificat_medical DROP CONSTRAINT FK_3C705FDBB03A8386');
        $this->addSql('ALTER TABLE certificat_medical DROP CONSTRAINT FK_3C705FDB896DBBDE');
        $this->addSql('DROP INDEX IDX_3C705FDBB03A8386');
        $this->addSql('DROP INDEX IDX_3C705FDB896DBBDE');
        $this->addSql('ALTER TABLE certificat_medical DROP created_by_id');
        $this->addSql('ALTER TABLE certificat_medical DROP updated_by_id');
        $this->addSql('ALTER TABLE pilot_qualification DROP CONSTRAINT FK_A9811BEEB03A8386');
        $this->addSql('ALTER TABLE pilot_qualification DROP CONSTRAINT FK_A9811BEE896DBBDE');
        $this->addSql('DROP INDEX IDX_A9811BEEB03A8386');
        $this->addSql('DROP INDEX IDX_A9811BEE896DBBDE');
        $this->addSql('ALTER TABLE pilot_qualification DROP created_at');
        $this->addSql('ALTER TABLE pilot_qualification DROP updated_at');
        $this->addSql('ALTER TABLE pilot_qualification DROP created_by_id');
        $this->addSql('ALTER TABLE pilot_qualification DROP updated_by_id');
        $this->addSql('ALTER TABLE entretien DROP CONSTRAINT FK_2B58D6DAB03A8386');
        $this->addSql('ALTER TABLE entretien DROP CONSTRAINT FK_2B58D6DA896DBBDE');
        $this->addSql('DROP INDEX IDX_2B58D6DAB03A8386');
        $this->addSql('DROP INDEX IDX_2B58D6DA896DBBDE');
        $this->addSql('ALTER TABLE entretien DROP created_at');
        $this->addSql('ALTER TABLE entretien DROP updated_at');
        $this->addSql('ALTER TABLE entretien DROP created_by_id');
        $this->addSql('ALTER TABLE entretien DROP updated_by_id');
    }
}
