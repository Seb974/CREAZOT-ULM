<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250818061926 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE prestation ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD created_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD updated_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD CONSTRAINT FK_51C88FADB03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE prestation ADD CONSTRAINT FK_51C88FAD896DBBDE FOREIGN KEY (updated_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_51C88FADB03A8386 ON prestation (created_by_id)');
        $this->addSql('CREATE INDEX IDX_51C88FAD896DBBDE ON prestation (updated_by_id)');
        $this->addSql('ALTER TABLE vol ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD created_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD updated_by_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD CONSTRAINT FK_95C97EBB03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE vol ADD CONSTRAINT FK_95C97EB896DBBDE FOREIGN KEY (updated_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_95C97EBB03A8386 ON vol (created_by_id)');
        $this->addSql('CREATE INDEX IDX_95C97EB896DBBDE ON vol (updated_by_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE prestation DROP CONSTRAINT FK_51C88FADB03A8386');
        $this->addSql('ALTER TABLE prestation DROP CONSTRAINT FK_51C88FAD896DBBDE');
        $this->addSql('DROP INDEX IDX_51C88FADB03A8386');
        $this->addSql('DROP INDEX IDX_51C88FAD896DBBDE');
        $this->addSql('ALTER TABLE prestation DROP created_at');
        $this->addSql('ALTER TABLE prestation DROP updated_at');
        $this->addSql('ALTER TABLE prestation DROP created_by_id');
        $this->addSql('ALTER TABLE prestation DROP updated_by_id');
        $this->addSql('ALTER TABLE vol DROP CONSTRAINT FK_95C97EBB03A8386');
        $this->addSql('ALTER TABLE vol DROP CONSTRAINT FK_95C97EB896DBBDE');
        $this->addSql('DROP INDEX IDX_95C97EBB03A8386');
        $this->addSql('DROP INDEX IDX_95C97EB896DBBDE');
        $this->addSql('ALTER TABLE vol DROP created_at');
        $this->addSql('ALTER TABLE vol DROP updated_at');
        $this->addSql('ALTER TABLE vol DROP created_by_id');
        $this->addSql('ALTER TABLE vol DROP updated_by_id');
    }
}
